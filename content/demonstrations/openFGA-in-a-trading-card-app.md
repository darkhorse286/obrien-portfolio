---
title: "How do you know your authorization model is correct?"
date: "June 2026"
tech: ".NET 10, OpenFGA v1.15.1, xUnit, Testcontainers"
description: "An adversarial test pattern for relationship-based authorization models, using real OpenFGA infrastructure, per-class store isolation, and named scenarios to produce evidence of model correctness."
---

# How do you know your authorization model is correct?

## Proposition

**An adversarial test suite running named scenarios against a real, isolated OpenFGA instance produces stronger evidence of authorization model correctness than a suite that mocks the authorization engine, because it tests decisions rather than calls.**

## Given Constraints

Let M be an authorization model defined in the OpenFGA DSL. Let d(u, r, o, ctx) denote the authorization decision for user u, relation r, object o, and contextual parameters ctx. Let C be the set of conditional relationships in M. For any c in C, d depends on the engine's evaluation of c against ctx at query time.

Define two test suite strategies. T_mock replaces `CheckAsync` and `ListObjectsAsync` with test doubles whose return values are configured by the test author. T_real executes those calls against a live OpenFGA instance loaded with M.

Observation 1: For unconditional tuples, T_mock(d) = T_real(d) when the test double is correctly configured. For conditional tuples, T_mock(d) is the value the test author programmed. T_real(d) is the value the engine computes by evaluating c against ctx. These are equal only if the test author correctly anticipates every condition the engine evaluates.

Observation 2: The trading card authorization model contains at least one conditional relationship, `not_expired`. For any d involving `not_expired`, T_real evaluates the condition against ctx.current_time. T_mock cannot perform this evaluation.

Observation 3: A suite S_mock that achieves 100% coverage over the application code path makes no claim about whether T_real(d) = T_mock(d) for any conditional relationship. S_mock cannot detect a missing context parameter, a malformed condition argument, or an engine evaluation that produces an unexpected result.

From these observations: for a system whose authorization model contains conditional relationships, S_mock produces evidence of call conformance only. It does not produce evidence of model correctness.

H₀: Coverage over the application integration layer constitutes sufficient evidence of authorization model correctness, because the engine is a black box whose behavior is fully specified by its interface contract, and any conforming test double is evidentially equivalent to the production engine.

A falsifiable systems claim. This project refutes H₀. The evidence follows.

## Methodology

### Background

Relationship-Based Access Control derives authorization decisions from paths traversable in a relationship graph at query time, rather than from a static permission matrix. In Role-Based Access Control, the question is whether a permission entry exists. In ReBAC, the question is whether a traversable path exists between the user and the resource given the current tuple state. The graph is dynamic. Its state changes as the application raises domain events and writes tuples. The number of reachable states is not finite in the way a permission matrix is.

OpenFGA implements ReBAC through a DSL that defines relationship types and the conditions under which they grant access, and a tuple store that holds runtime relationship instances. This article concerns testing methodology for that model, not the design of the model itself.

### Decision 1: Authorization Engine Infrastructure

Three infrastructure strategies were evaluated before test development began.

A shared development instance provides a realistic data environment and exercises the real engine. The decisive argument against it is that shared state is not isolated per test run. A tuple written by one test persists across runs unless cleanup succeeds. A test that should fail can pass because a previous run left the required tuple in place. Environment dependency becomes a coordination problem between developers. The validity of any passing test depends on the execution history of every previous run.

A mocked implementation eliminates infrastructure cost, achieves full application-layer coverage, and is fast. The decisive argument against it is the one that motivates the post: a test double does not evaluate conditions in M. It returns what the test author programmed. If the model's condition logic is incorrect, or the caller omits a required context parameter, or the engine evaluates a condition in a way the test author did not predict, S_mock will not detect any of these gaps. The evidence is over calls, not decisions.

A real engine via Testcontainers was chosen. The production-equivalent OpenFGA binary runs in a pinned container (`openfga/openfga:v1.15.1`) started at test run initialization. The container is isolated to the test run. The version is explicit. There is no shared environment. Every run starts clean. The startup cost is bounded and acceptable given the strength of the evidence it produces.

### Decision 2: Store Isolation Granularity

With a real engine running, the granularity of tuple store isolation is the second decision.

A single shared store with per-test cleanup is simpler to set up. The decisive argument against it is that cleanup is behavioral rather than structural. A cleanup failure leaves state. Parallel test execution races on cleanup timing. An adversarial test that should fail can pass because a prior test wrote the required tuple and cleanup did not complete. The failure mode is invisible in test output: the test passes, the store is dirty, and no signal indicates the problem.

Per-class store isolation was chosen. `FgaTestBase` creates a store keyed to the test class name at class initialization and deletes it at teardown. Tests within a class share a store only when the test explicitly arranges shared state. Tests across classes share nothing, regardless of execution order or parallelism. Isolation is a structural property of the design, not a behavioral discipline. A scenario cannot inherit state it did not write.

### Decision 3: Tuple Write Pattern

Two approaches to test setup tuple writes were evaluated.

Inline tuple writes per test method produce self-contained, readable tests. The decisive argument against them is that they bypass the production tuple writers. If a domain event handler (`ITupleWriterHandler`) produces an incorrect tuple structure, inline-write tests will not detect it. The tests write correct tuples directly against the FGA client. Production writes an incorrect tuple through the handler. The adversarial scenario passes in the test suite and fails in production.

The event-driven pipeline was mirrored in test setup. Production routes domain events through `TupleWriterDispatcher` to dedicated `ITupleWriterHandler` implementations. Test setup invokes the same writers or mirrors their tuple structure exactly. A writer that produces incorrect tuples causes the adversarial scenario to fail. The expected authorization graph is derivable by reading the writers, not by tracing application execution. Setup is deterministic and auditable.

See the Appendix for the event-to-tuple pipeline diagram.

### Decision 4: Scenario Design

Coverage targets and named adversarial scenarios were evaluated as competing approaches to test design.

Coverage-oriented testing aims for a high percentage of lines or branches executed. The decisive argument against it is that coverage percentage makes no claim about whether the engine returned the correct decision. A test that exercises the `CheckAsync` call path using a mock has identical coverage to one that exercises it against the real engine. The metrics are indistinguishable. The evidence is not.

Named adversarial scenarios were chosen. Each test method is a named claim about an authorization property the model must satisfy. The scenario name is the claim. The assertion is the test. A failing scenario names the broken property precisely. This structure makes the test suite a proof obligation: for each named property, either a passing scenario demonstrates the property holds, or there is no evidence it holds.

## Evidence

### Exhibit A: ListObjects Does Not Evaluate `not_expired` Without Context

**Claim under test:** The adversarial suite will detect authorization gaps that exist at the model level but have no active application expression.

**Data:** During T1 test development, the scenario `Guardian_CannotSee_ExpiredDelegations_Via_ListObjects` produced an unexpected pass when it should have failed. Review of `OpenFgaAuthorizationService` identified that `ListObjectsAsync` calls omitted `current_time` from the request context. `CheckAsync` calls were passing context correctly. `ListObjects` was not.

Before remediation:

```csharp
// context omitted: not_expired condition cannot be evaluated
var response = await _client.ListObjectsAsync(new ClientListObjectsRequest
{
    User = userId,
    Relation = relation,
    Type = objectType
});
```

After remediation:

```csharp
var response = await _client.ListObjectsAsync(new ClientListObjectsRequest
{
    User = userId,
    Relation = relation,
    Type = objectType,
    Context = new { current_time = _clock.UtcNow.ToString("O") }
});
```

Without `current_time`, OpenFGA cannot evaluate `not_expired` and returns the tuple as if the condition were satisfied. The engine was returning expired delegations in `ListObjects` results because the condition was unevaluable, not because it evaluated to true.

**Reading:** The retrospective determined that no production feature had yet reached a state where `ListObjects` was used to enumerate delegated trades. The delegation path to roster visibility was real at the model level and latent at the application layer. The adversarial suite identified the gap before the application could express it.

**Caveats:** The claim that this gap would have produced incorrect production behavior is not supported. The gap was latent. The adversarial suite found a latent gap, not an active defect. S_mock with identical application-layer coverage would not have found this gap, because S_mock does not evaluate conditions.

### Exhibit B: `not_expired` Evaluates Correctly at Both Query Boundaries When Context Is Supplied

**Claim under test:** OpenFGA correctly evaluates `not_expired` during both `Check` and `ListObjects` when `current_time` is present in the request context. The evaluation is performed by the engine. The time value is not interpreted by the application.

**Data:** After remediation, the T1 suite exercises four evaluation points per delegation:

```
Setup: WriteTuple(
  user:guardian-1 -> delegate -> trade:t100,
  condition: not_expired { expiration: T+60min }
)

Check at T+30min (before expiry):
  CheckAsync(user:guardian-1, can_supervise, trade:t100,
             context: { current_time: T+30min })
  Expected: Allowed     Result: Allowed     (pass)

Check at T+90min (after expiry):
  CheckAsync(user:guardian-1, can_supervise, trade:t100,
             context: { current_time: T+90min })
  Expected: Denied      Result: Denied      (pass)

ListObjects at T+30min:
  ListObjectsAsync(user:guardian-1, can_supervise, trade,
                  context: { current_time: T+30min })
  Expected: [trade:t100]     Result: [trade:t100]     (pass)

ListObjects at T+90min:
  ListObjectsAsync(user:guardian-1, can_supervise, trade,
                  context: { current_time: T+90min })
  Expected: []               Result: []               (pass)
```

The adversarial suite added two tests during remediation: one demonstrating the corrected behavior and one anchoring the pre-fix behavior as a regression test. The isolation design accommodated both additions without changes to `FgaTestBase` or `OpenFgaFixture`.

**Reading:** The engine evaluates `not_expired` correctly at both query boundaries when context is supplied. The expiration value lives in the tuple, not in application state or the database. The caller supplies `current_time`. The engine decides. The application does not perform the comparison.

**Caveats:** These results use the in-memory datastore. Behavior between the in-memory store and a production Postgres-backed store has not been evaluated and is not claimed to be equivalent.

### Exhibit C: Snapshot Supervisor Semantics Are Preserved

**Claim under test:** When a supervision delegation is valid at the time a trade is proposed, the supervisor's authorization against that trade is preserved even after the delegation expires, reflecting the intended snapshot semantics of the model.

**Data:** DelegationTradeSupervisionIntegrationTests (T2) exercises the following sequence:

```
T=0:   WriteTuple(user:guardian, delegate, trade:t200,
                  condition: not_expired { expiration: T+120min })

T=1:   Trade proposed. Supervisor tuple written reflecting
       user:guardian as supervisor of trade:t200.

T=2:   Delegation expires (clock advances past T+120min).

T=180: CheckAsync(user:guardian, can_supervise, trade:t200,
                  context: { current_time: T+180min })
       Expected: Allowed     Result: Allowed     (pass)
```

**Reading:** The model preserves the supervision relationship established at trade-proposal time. The T2 suite documents this as an explicit, passing specification. Any future change to the model that breaks snapshot semantics will produce a failing T2 test before deployment.

**Caveats:** The named scenario represents one formulation of snapshot semantics. It is not a complete specification of all snapshot cases the model may need to handle as the domain evolves. The scenario is a regression anchor, not a proof of completeness.

### Exhibit D: Incremental Growth Without Fixture Redesign

**Claim under test:** The isolation design accommodates incremental scenario addition without modifying existing fixture infrastructure.

**Data:** The suite grew from 323 tests to 325 during T1 remediation. Two new scenarios were added to `DelegationExpiryTests`. Zero changes were made to `FgaTestBase`, `OpenFgaFixture`, or any existing test class.

| Stage | Total Tests | Failures | Fixture Changes |
|---|---|---|---|
| Pre-remediation | 323 | 0 | N/A |
| Post-remediation | 325 | 0 | 0 |

Adding a scenario to an existing class extends that class's isolated store. Adding a new class creates a new isolated store. Neither operation touches shared infrastructure.

**Reading:** Per-class isolation is structural. Scaling is a local operation. The design does not require coordination.

**Caveats:** This evidence covers one remediation cycle adding two tests. It does not characterize the design at significantly higher test counts, or under concurrent development where multiple engineers add scenarios simultaneously.

## QED

The T1 finding was this: a single omission (`current_time` absent from `ListObjectsAsync`) left the `not_expired` condition unevaluable at the list boundary, causing OpenFGA to return expired delegations as active. The adversarial suite identified this during scenario development, before any production feature had reached the state where the gap could manifest. An S_mock suite with identical application-layer coverage would have achieved the same coverage metrics and found nothing. The difference is categorical: S_mock cannot evaluate what it does not execute.

The caveat that survives is scope. 325 tests over 25 named authorization properties against an in-memory datastore is not completeness. The model covers a limited number of object and entity types. Postgres-backed store behavior is not characterized. Formal verification has not been performed. The suite proves that named properties hold under the modeled scenarios. It does not prove that no unnamed scenario exists in which a property fails.

The evidence supports a partial refutation of H₀. The engine is not a black box whose behavior is fully specified by its interface contract. For conditional relationships, the contract specifies the call signature; it does not specify the evaluation result for every possible ctx. Treating a mock as evidentially equivalent to the real engine for conditional relationships is incorrect. The T1 finding demonstrates the practical consequence.

This post contributes a replicable instance of the adversarial pattern in .NET 10 against a trading card domain, with one documented gap found and remediated before production expression, and a fixture design that accommodated the remediation without structural change.

∎

---

## Appendix

### Terms for Non-Practitioners

**ReBAC (Relationship-Based Access Control).** An authorization paradigm that derives access decisions from traversable paths in a relationship graph rather than from static role assignments. Whether a user can act on a resource depends on whether a named relationship chain connects them at query time. Unlike a permission matrix, the graph is dynamic: its state changes as the application writes new relationships. This matters to this post because the dynamic, graph-structured nature of ReBAC is what makes test coverage insufficient evidence. The space of reachable authorization states cannot be fully described by a permission table, so it cannot be fully validated by a test suite that only validates the call to the table.

**OpenFGA.** An open-source authorization engine implementing the Google Zanzibar model. The authorization model is defined in a DSL specifying relationship types and the conditions under which they grant access. Tuples are runtime relationship instances: the triple (user, relation, object). OpenFGA evaluates authorization queries by traversing the tuple graph against the model, applying conditions as it goes. This matters to this post because OpenFGA evaluates conditions at query time using caller-supplied context. A test that does not supply that context cannot observe the conditional evaluation, and a mock that does not implement the condition cannot detect when the condition would produce an unexpected result.

**Tuple.** The atomic unit of state in an OpenFGA store. A tuple asserts that a relationship holds: (user:guardian-1, delegate, trade:t100). A conditional tuple attaches evaluation parameters to the assertion: the relationship holds only when the engine evaluates the attached condition as true against the caller-supplied context. This matters to this post because deterministic test setup requires knowing exactly which tuples the production pipeline writes, and the event-driven architecture is what makes those writes auditable.

**`not_expired` condition.** An OpenFGA built-in condition that evaluates to true when the caller-supplied `current_time` is before an expiration timestamp embedded in the tuple at write time. The engine performs the comparison. The application does not. This matters to this post because the T1 finding was precisely that `current_time` was absent from `ListObjects` requests, leaving this condition unevaluable at the list boundary.

**Check vs. ListObjects.** Two OpenFGA query APIs. `Check` asks whether user u has relation r on a specific object o. `ListObjects` asks for the set of objects of type T for which user u has relation r. Both accept a context argument used to evaluate conditional relationships. This matters to this post because the production omission of `current_time` affected `ListObjects` but not `Check`, and the adversarial suite exercises both boundaries.

**Testcontainers.** A test library that starts and manages Docker containers programmatically within a test run. The container is pulled by image tag, started before the first test, and stopped after the last. This matters to this post because it is the mechanism that makes real-engine testing portable without a shared environment. Any developer with Docker Desktop and the .NET 10 SDK can reproduce the results by running `dotnet test`.

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

The adversarial suite sits above unit tests and below full integration tests. It exercises the authorization model in isolation from the application stack. It does not test HTTP routing, database persistence, or application business logic.

#### Diagram 2: Per-Class Store Isolation Lifecycle

```
Test Run Start
  |
  v
OpenFgaFixture.InitializeAsync()
  Start openfga/openfga:v1.15.1 container
  Instantiate OpenFgaClient pointing at container

  [container is shared across all test classes]

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
| DelegationExpiryTests (T1) | `not_expired` evaluated by both Check and ListObjects when `current_time` is supplied | Denied after expiry; allowed before | Check + ListObjects |
| DelegationTradeSupervisionIntegrationTests (T2) | Snapshot supervisor semantics preserved at delegation time | Allowed at T+180min given valid delegation at T+1min | Check |
| OwnershipTests | Card owner has full access; non-owner has none | Allowed for owner, Denied for non-owner | Check |
| CollectionVisibilityTests | Public collections readable; private collections isolated | Returned for public, not listed for private | ListObjects |
| TradeProposalTests | Proposer and recipient have access; uninvolved parties do not | Allowed for parties, Denied for third parties | Check |
| DealerPrivilegeTests | Dealer-exclusive relations inaccessible to collectors | Denied for collector regardless of card ownership | Check |

#### Diagram 4: Event-to-Tuple Pipeline

```
Application Layer

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

Because all tuple writes flow through named handlers, the authorization graph is derivable by reading the writers. Test setup mirrors this structure. A writer that produces incorrect tuples causes an adversarial scenario to fail. The failure names the broken property.

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
  clock.Set(T+30min)
  CheckAsync(user:guardian-1, can_supervise, trade:t100,
             ctx: { current_time: T+30min })
  -> Allowed  (expected: Allowed)  PASS

Scenario: Guardian_CannotSupervise_AfterDelegationExpiry
  clock.Set(T+90min)
  CheckAsync(user:guardian-1, can_supervise, trade:t100,
             ctx: { current_time: T+90min })
  -> Denied   (expected: Denied)   PASS

Scenario: Guardian_CanSee_ActiveDelegation_Via_ListObjects
  clock.Set(T+30min)
  ListObjectsAsync(user:guardian-1, can_supervise, trade,
                  ctx: { current_time: T+30min })
  -> [trade:t100]   (expected: [trade:t100])   PASS

Scenario: Guardian_CannotSee_ExpiredDelegation_Via_ListObjects
  clock.Set(T+90min)
  ListObjectsAsync(user:guardian-1, can_supervise, trade,
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