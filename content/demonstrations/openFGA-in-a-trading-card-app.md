---
title: "How do you know your authorization model is correct?"
date: "June 2026"
tech: ".NET 10, OpenFGA v1.15.1, xUnit, Testcontainers"
description: "An adversarial testing pattern for relationship-based authorization models using real OpenFGA infrastructure and isolated stores."
---

# How do you know your authorization model is correct?

## Proposition

**An adversarial test suite running named scenarios against a real, isolated OpenFGA instance produces stronger evidence of authorization model correctness than a suite that mocks the authorization engine, because it tests decisions rather than calls.**

This claim appears unnecessarily expensive at first inspection. OpenFGA already exposes a stable API. Applications call `CheckAsync`. Applications call `ListObjectsAsync`. Mocks can return any value those methods would return. Coverage reports are identical.

Why start Docker containers? Why provision stores? Why manage authorization models? Why pay the runtime cost of a real engine if the interface contract is already known? Because the interface contract is not the system. The authorization decision is the system. Once conditional relationships enter the model, the caller no longer determines the result. The caller merely supplies state. The engine evaluates it.

A call that omits required evaluation context still completes. The response shape is valid. In this implementation, the resulting authorization decision is incorrect, yet nothing in the interface contract signals that the evaluation itself was incomplete. Only comparing the engine's actual decision against the model's intended behavior can detect this class of defect.

The engineering question is therefore not:

> Can my service call OpenFGA correctly?

The engineering question is:

> Can I produce evidence that the authorization model itself behaves correctly?

This project treats that question as a falsifiable systems claim.

## Given Constraints

Let:

- **M** = an authorization model expressed in the OpenFGA DSL
- **d(u, r, o, ctx)** = the authorization decision for user *u*, relation *r*, object *o*, and evaluation context *ctx*
- **C** = the set of conditional relationships defined in *M*

For any c ∈ C, the authorization decision depends upon runtime evaluation performed by the engine, not by the caller.

Consider two testing strategies. **T_mock** replaces `CheckAsync` and `ListObjectsAsync` with test doubles configured by the test author. **T_real** executes those same calls against a live OpenFGA instance loaded with M.

For unconditional tuples, T_mock(d) = T_real(d), provided the mock was configured correctly. For conditional tuples, T_mock(d) is whatever the test author programmed. T_real(d) is whatever the engine computes after evaluating the condition against the supplied context.

The trading card authorization model contains a conditional relationship, `not_expired`, whose evaluation depends on `ctx.current_time`. A mocked authorization engine does not evaluate this condition. It returns whatever the test author expected the condition would evaluate to.

Therefore: a test suite achieving complete application-layer coverage does not establish that the authorization model behaves correctly. It establishes only that the application calls the authorization layer correctly.

**H₀:** Coverage over the application integration layer constitutes sufficient evidence of authorization model correctness, because the authorization engine is a black box whose behavior is fully specified by its interface contract, and a mocked authorization engine is evidentially equivalent to the production engine.

A falsifiable systems claim. This project refutes H₀. The evidence follows.

## Methodology

### Background

Relationship-Based Access Control derives authorization decisions from traversable paths in a relationship graph rather than from a static permission matrix. Traditional RBAC asks whether a permission entry exists. ReBAC asks whether a valid path currently exists between this user and this resource. The graph changes continuously as tuples are written and removed. Conditional tuples add another dimension: whether a relationship exists depends upon engine evaluation at query time. This article concerns testing methodology for that model, not the model itself.

### Decision 1: Authorization Engine Infrastructure

Three approaches were evaluated.

**Shared Development Instance.** The advantages are a real engine, real data, and minimal local setup. The fatal weakness is shared state. A tuple written by one test persists until cleanup succeeds. A failing cleanup operation silently contaminates future runs. Test validity depends upon execution history. The environment itself becomes part of the test.

**Mocked Authorization Engine.** The advantages are speed, no infrastructure dependency, and full application-layer coverage. The fatal weakness is that the mock evaluates nothing. Conditional relationships become hardcoded expectations. A missing context parameter, a malformed condition, or an unexpected engine evaluation are all unobservable. The evidence concerns calls, not decisions.

**Real Engine via Testcontainers.** Chosen. A pinned production-equivalent image (`openfga/openfga:v1.15.1`) starts automatically before test execution. Each run begins from an empty state. Versioning is explicit. Infrastructure is reproducible. The runtime cost consists primarily of container initialization, authorization model loading, and isolated store creation. These costs proved acceptable for local development and CI execution. Formal benchmarking was outside the scope of this project and remains future work.

### Decision 2: Store Isolation

Two approaches were evaluated.

**Shared Store with Cleanup.** Simple. Fragile. Cleanup is behavioral rather than structural. A cleanup failure leaves residual state. Parallel execution introduces races. A scenario may pass because another scenario previously created the required tuple. The failure mode is invisible in test output.

**Per-Class Store Isolation.** Chosen. `FgaTestBase` creates a dedicated store for each test class at initialization and deletes it at teardown. Tests inside the class share only the state they intentionally create. Classes share nothing. Isolation is structural, not procedural. A scenario cannot inherit state it did not write.

### Decision 3: Tuple Generation

Two setup patterns were evaluated.

**Inline Tuple Writes.** Readable and self-contained, but at an incorrect abstraction boundary. Production writes tuples through domain event handlers. Inline setup bypasses those handlers entirely. A tuple writer may be wrong while every test still passes.

**Event-Driven Setup.** Chosen. Production routes domain events through `TupleWriterDispatcher` to `ITupleWriterHandler` implementations. Test setup mirrors that pipeline. Tuple structure is derived from production behavior. A broken tuple writer breaks the adversarial scenario. The authorization graph remains auditable.

See the Appendix for the event-to-tuple pipeline diagram.

### Decision 4: Test Design

Coverage targets and named adversarial scenarios were evaluated.

**Coverage-Oriented Testing.** Coverage measures execution, not correctness. A mocked authorization call and a real authorization call produce identical coverage numbers. The metrics are indistinguishable. The evidence is not.

**Named Adversarial Scenarios.** Chosen. Each test represents a single authorization property. The scenario name is the claim. The assertion is the evidence. A failing scenario names the broken property directly. The suite becomes a collection of proof obligations rather than a collection of executed lines.

The six scenario classes in this project are derived from `authz/model.fga`. Reading the model top-to-bottom produces the initial scenario skeleton. Each externally observable authorization property becomes a scenario candidate. Conditional relationships additionally require boundary scenarios around their evaluation thresholds. The T1 class derives from the `not_expired` condition; the T2 class derives from the supervision relation's snapshot semantics; the remaining four classes correspond to ownership, collection visibility, trade proposal access, and dealer privilege relations. A new externally observable authorization property naturally suggests an additional adversarial scenario. The method identifies what to test. Domain knowledge determines the setup that makes each scenario adversarial.

## Evidence

### Exhibit A: The Adversarial Suite Identified a Latent Integration Gap

**Claim under test:** The adversarial suite will detect authorization gaps that exist at the model level but have no active application expression.

**Data:** During development of `Guardian_CannotSee_ExpiredDelegations_Via_ListObjects`, the expected denial did not occur. Inspection of `OpenFgaAuthorizationService` revealed an asymmetry. `CheckAsync` supplied evaluation context. `ListObjectsAsync` did not.

Before remediation:

```csharp
var response = await _client.ListObjectsAsync(
    new ClientListObjectsRequest
    {
        User = userId,
        Relation = relation,
        Type = objectType
    });
```

After remediation:

```csharp
var response = await _client.ListObjectsAsync(
    new ClientListObjectsRequest
    {
        User = userId,
        Relation = relation,
        Type = objectType,
        Context = new
        {
            current_time = _clock.UtcNow.ToString("O")
        }
    });
```

The omission was invisible to application-layer coverage. Both implementations exercised identical code paths. Only the real engine attempted to evaluate the condition.

**Reading:** The observed failure mode is a silent authorization downgrade. In this implementation, when the engine cannot evaluate the condition because required context is absent, the request completes successfully and the tuple is returned as active. No evaluation error is surfaced to the caller. A conditional authorization boundary effectively becomes unconditional. The observable defect is an incorrect decision: expired delegations returned as active. The root cause is a call-level omission. The adversarial suite detected this because it evaluated the actual decision against the model's intended behavior. T_mock cannot detect it because T_mock does not evaluate conditions regardless of what context is or is not supplied. The defect class is not specific to `not_expired`. Any conditional relationship in the model is susceptible to the same category of failure if the caller omits information required for evaluation.

**Caveats:** The claim that this gap would have produced a production incident is not supported. The delegation path to roster visibility was real at the model level and latent at the application layer. The suite found a latent gap, not an active defect.

### Exhibit B: Conditional Relationships Require Engine Evaluation

**Claim under test:** OpenFGA correctly evaluates `not_expired` at both `Check` and `ListObjects` query boundaries when `current_time` is present in the request context. The evaluation is performed by the engine. The application does not compare timestamps.

**Data:** The T1 suite writes a delegation valid for sixty minutes and exercises it across both query boundaries.

```
WriteTuple(
    user:guardian-1,
    delegate,
    trade:t100,
    condition: not_expired { expiration: T+60min }
)
```

| Query       | Time | Expected | Result  |
| ----------- | ---- | -------- | ------- |
| Check       | T+30 | Allowed  | Allowed |
| Check       | T+90 | Denied   | Denied  |
| ListObjects | T+30 | Present  | Present |
| ListObjects | T+90 | Absent   | Absent  |

**Reading:** The expiration timestamp exists only inside the tuple. The caller supplies `current_time`. The engine performs the evaluation. The adversarial suite validates the authorization model itself rather than merely validating application integration.

**Caveats:** Results characterize the OpenFGA in-memory datastore. Postgres-backed behavior has not been evaluated and is not claimed to be equivalent.

### Exhibit C: Snapshot Semantics Are Preserved

**Claim under test:** When a supervision delegation is valid at the time a trade is proposed, the supervisor's authorization against that trade is preserved even after the delegation expires.

**Data:** DelegationTradeSupervisionIntegrationTests (T2) exercises the following sequence:

```
T=0    Delegation granted.
T=1    Trade proposed. Supervisor tuple written.
T=2    Delegation expires.
T=180  Supervisor queries trade.

Expected: Allowed
Observed: Allowed    (pass)
```

**Reading:** The model captures supervision relationships at trade proposal time. The T2 suite documents this as an explicit, passing specification. Future modifications that alter this invariant produce a failing scenario before deployment.

**Caveats:** This demonstrates one temporal invariant. It is not a proof of complete temporal correctness. The scenario is a regression anchor, not a proof of completeness.

### Exhibit D: Structural Isolation Scales

**Claim under test:** The isolation design accommodates incremental scenario addition without modifying existing fixture infrastructure.

**Data:** The T1 remediation added two new scenarios.

| Stage  | Tests | Failures | Fixture Changes |
| ------ | ----- | -------- | --------------- |
| Before | 323   | 0        | N/A             |
| After  | 325   | 0        | 0               |

No changes were required to `FgaTestBase`, `OpenFgaFixture`, store lifecycle management, or container management.

**Reading:** Per-class isolation scales by local extension. Adding a scenario extends the local proof set. Adding a new class creates a new isolated store. Neither operation modifies shared infrastructure.

**Caveats:** This evidence covers one remediation cycle adding two tests. It does not characterize the design at significantly higher test counts or under concurrent development by multiple engineers.

## QED

The T1 result was not that a production bug was found. The T1 result was that a real authorization engine and a mocked authorization engine are not evidentially equivalent once conditional relationships enter the model. One omitted context parameter left `not_expired` unevaluable at the `ListObjects` boundary. The adversarial suite identified the gap before any production feature depended upon it. A mocked suite with identical application-layer coverage would have achieved identical coverage metrics while observing no difference. That is the distinction between testing calls and testing decisions.

The fixture architecture survived the remediation unchanged. Two additional scenarios extended the proof set without modifying shared infrastructure. The model grew locally.

The limitations remain. 325 tests across 25 named authorization properties do not constitute formal verification. Postgres-backed behavior has not been characterized. Suite execution time has not been benchmarked and CI pipeline integration has not been evaluated. Unnamed scenarios may still exist in which a property fails.

The evidence supports a partial refutation of H₀. For authorization systems with conditional relationships, the authorization model becomes executable business logic. Executable business logic should be tested by execution, not simulation. For conditional relationships, a mocked authorization engine is not evidentially equivalent to the production engine. The T1 result demonstrates the practical consequence. This post contributes a replicable instance of the adversarial pattern in .NET 10, with one documented gap found and remediated before production expression, and a fixture design that accommodated the remediation without structural change.

∎

---

## Appendix

### Terms

**Relationship-Based Access Control (ReBAC).** An authorization paradigm in which access decisions derive from traversable paths in a relationship graph rather than static role assignments. Whether a user can act on a resource depends on whether a named relationship chain connects them at query time. This matters to this post because the dynamic, graph-structured nature of ReBAC makes test coverage an insufficient standard of evidence. The space of reachable authorization states cannot be fully described by a permission table, so it cannot be fully validated by a test suite that only validates the call to the table.

**OpenFGA.** An implementation of the Google Zanzibar authorization model. Authorization state consists of tuples. Authorization decisions are computed by traversing those tuples against a DSL-defined model, applying conditions at query time. This matters to this post because OpenFGA evaluates conditions using caller-supplied context. A test that does not supply that context cannot observe the conditional evaluation, and a mock that does not implement the condition cannot detect when the condition would produce an unexpected result.

**Tuple.** The atomic unit of authorization state: (user, relation, object). Conditional tuples extend that assertion with evaluation rules executed by the engine at query time. This matters to this post because deterministic test setup requires knowing exactly which tuples the production pipeline writes, and the event-driven architecture is what makes those writes auditable.

**`not_expired` condition.** A conditional relationship that evaluates to true when the caller-supplied `current_time` is before an expiration timestamp embedded in the tuple at write time. The comparison occurs inside the engine. The application supplies context. It does not perform the evaluation. This matters to this post because the T1 finding was precisely that `current_time` was absent from `ListObjects` requests, leaving this condition unevaluable at that boundary.

**Check vs. ListObjects.** `Check` asks whether user U has relation R on a specific object O. `ListObjects` asks for every object of type T for which user U has relation R. Both require identical evaluation context for conditional relationships. This matters to this post because the production omission of `current_time` affected `ListObjects` but not `Check`, and the adversarial suite exercises both boundaries.

**Testcontainers.** A testing library that provisions Docker containers automatically during test execution. The adversarial suite uses Testcontainers to create a reproducible, production-equivalent OpenFGA environment for every test run without a shared environment dependency. This matters to this post because it is the mechanism that makes real-engine testing portable: any developer with Docker Desktop and the .NET 10 SDK can reproduce the results by running `dotnet test`.

### Supplemental Diagrams

#### Diagram 1: Test Pyramid Placement

```
             ^
             |   Full Integration Tests
             |   (HTTP layer, database, full application stack)
             |   -------------------------------------------------------
             |   Adversarial Authorization Suite         <- this suite
             |   (real FGA engine, no application layer,
             |    per-class isolated stores, named scenarios)
             |   -------------------------------------------------------
             |   Infrastructure Unit Tests
             v   (services, handlers, repositories, application logic)
          more tests
```

The adversarial suite sits above unit tests and below full integration tests. It exercises the authorization model in isolation from the application stack.

#### Diagram 2: Per-Class Store Isolation Lifecycle

```
Test Run Start
  |
  v
OpenFgaFixture.InitializeAsync()
  Start openfga/openfga:v1.15.1 container
  Instantiate OpenFgaClient

  [container shared across all test classes]

  For each test class:

    FgaTestBase.InitializeAsync()
      CreateStoreAsync(name: typeof(TestClass).Name)
      WriteAuthorizationModelAsync(M) into new store
      StoreId scoped to this class

      [Scenario 1]  WriteTuples -> Check / ListObjects -> Assert
      [Scenario 2]  WriteTuples -> Check / ListObjects -> Assert
      [Scenario N]  WriteTuples -> Check / ListObjects -> Assert

    FgaTestBase.DisposeAsync()
      DeleteStoreAsync(StoreId)

  [all classes complete]

OpenFgaFixture.DisposeAsync()
  Stop and remove container
```

#### Diagram 3: Scenario Map

| Scenario Class | Authorization Property | Key Assertion | API |
|---|---|---|---|
| DelegationExpiryTests (T1) | `not_expired` evaluated at both boundaries when `current_time` supplied | Denied after expiry, allowed before | Check + ListObjects |
| DelegationTradeSupervisionIntegrationTests (T2) | Snapshot supervisor semantics preserved at delegation time | Allowed at T+180 given valid delegation at T+1 | Check |
| OwnershipTests | Card owner has full access; non-owner has none | Allowed for owner, Denied for non-owner | Check |
| CollectionVisibilityTests | Public collections readable; private collections isolated | Returned for public, not listed for private | ListObjects |
| TradeProposalTests | Proposer and recipient have access; uninvolved parties do not | Allowed for parties, Denied for third parties | Check |
| DealerPrivilegeTests | Dealer-exclusive relations inaccessible to collectors | Denied for collector regardless of ownership | Check |

#### Diagram 4: Event-to-Tuple Pipeline

```
Domain Event raised
(e.g. DelegationGrantedEvent, TradeProposedEvent)
        |
        v
TupleWriterDispatcher
Routes event by type to registered handler
        |
        v
ITupleWriterHandler implementation
(e.g. DelegationTupleWriter, TradeTupleWriter)
Constructs TupleKey[] from event data
        |
        v
OpenFgaAuthorizationService.WriteTuplesAsync()
        |
        v
OpenFGA Tuple Store
Authorization state updated
```

Because all tuple writes flow through named handlers, the authorization graph is derivable by reading the writers. A writer that produces incorrect tuples causes an adversarial scenario to fail. The failure names the broken property.

#### Diagram 5: DelegationExpiryTests Sequence (T1)

```
Test class init:
  Store created. Authorization model M loaded.

Setup:
  WriteTuple(
    user:guardian-1 -> delegate -> trade:t100,
    condition: not_expired { expiration: T+60min }
  )

Scenario: Guardian_CanSupervise_BeforeDelegationExpiry
  CheckAsync(guardian-1, can_supervise, trade:t100,
             ctx: { current_time: T+30min })
  -> Allowed  (expected: Allowed)  PASS

Scenario: Guardian_CannotSupervise_AfterDelegationExpiry
  CheckAsync(guardian-1, can_supervise, trade:t100,
             ctx: { current_time: T+90min })
  -> Denied   (expected: Denied)   PASS

Scenario: Guardian_CanSee_ActiveDelegation_Via_ListObjects
  ListObjectsAsync(guardian-1, can_supervise, trade,
                  ctx: { current_time: T+30min })
  -> [trade:t100]   (expected: [trade:t100])   PASS

Scenario: Guardian_CannotSee_ExpiredDelegation_Via_ListObjects
  ListObjectsAsync(guardian-1, can_supervise, trade,
                  ctx: { current_time: T+90min })
  -> []   (expected: [])   PASS

Key: current_time is stored in the tuple as expiration.
     The caller supplies current_time in context.
     The engine evaluates not_expired.
     The application performs no time comparison.
```

### Reproducibility

Dependencies: Docker Desktop and the .NET 10 SDK. OpenFGA v1.15.1 is pulled by Testcontainers at test start.

```bash
git clone https://github.com/darkhorse286/cardtrader
cd cardtrader
dotnet test --logger "console;verbosity=normal"
```

Expected output:

```
Test Run Successful.
Total tests: 325
     Passed: 325
      Failed: 0
```

Run only the adversarial authorization suite:

```bash
dotnet test --filter "Category=Authorization" --logger "console;verbosity=normal"
```

The authorization model is at `authz/model.fga`. It is version-controlled and diffable. Changes are visible in git history alongside the tests that document their behavioral implications.