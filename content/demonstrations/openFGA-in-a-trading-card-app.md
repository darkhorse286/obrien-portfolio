---

title: "How do you know your authorization model is correct?"
date: "June 2026"
tech: ".NET 10, OpenFGA v1.15.1, xUnit, Testcontainers"
description: "An adversarial testing pattern for relationship-based authorization models using real OpenFGA infrastructure and isolated stores."
------------------------------------------------------------------------------------------------------------------------------------------------

# How do you know your authorization model is correct?

## Proposition

**An adversarial test suite running named scenarios against a real, isolated OpenFGA instance produces stronger evidence of authorization model correctness than a suite that mocks the authorization engine, because it tests decisions rather than calls.**

This claim appears unnecessarily expensive at first inspection. OpenFGA already exposes a stable API. Applications call `CheckAsync`. Applications call `ListObjectsAsync`. Mocks can return any value those methods would return. Coverage reports are identical.

Why start Docker containers? Why provision stores? Why manage authorization models? Why pay the runtime cost of a real engine if the interface contract is already known? Because the interface contract is not the system. The authorization decision is the system. Once conditional relationships enter the model, the caller no longer determines the result. The caller merely supplies state. The engine evaluates it.

The engineering question is therefore not:

> Can my service call OpenFGA correctly?

The engineering question is:

> Can I produce evidence that the authorization model itself behaves correctly?

This project treats that question as a falsifiable systems claim.

---

## Given Constraints

Let:

* **M** = an authorization model expressed in the OpenFGA DSL
* **d(u,r,o,ctx)** = the authorization decision for user *u*, relation *r*, object *o*, and evaluation context *ctx*
* **C** = the set of conditional relationships defined in *M*

For any condition:

```
c ∈ C
```

the authorization decision depends upon runtime evaluation performed by the engine.

Consider two testing strategies.

```
Tmock
```

replaces `CheckAsync` and `ListObjectsAsync` with test doubles configured by the test author.

```
Treal
```

executes those same operations against a live OpenFGA instance loaded with M.

For unconditional tuples:

```
Tmock(d) = Treal(d)
```

provided the mock was configured correctly.

For conditional tuples:

```
Tmock(d)
```

is whatever the test author programmed.

```
Treal(d)
```

is whatever the engine computes after evaluating the condition against the supplied context.

The trading card authorization model contains a conditional relationship:

```
not_expired
```

whose evaluation depends upon:

```
ctx.current_time
```

A mocked authorization engine does not evaluate this condition. It returns whatever the test author expected the condition would evaluate to.
Therefore:

A test suite achieving complete application-layer coverage does not establish that the authorization model behaves correctly.

It establishes only that the application calls the authorization layer correctly.

---

### Null Hypothesis

**H₀:**

Coverage over the application integration layer constitutes sufficient evidence of authorization model correctness because the authorization engine is a black box whose behavior is fully specified by its interface contract.

Equivalently:

A mocked authorization engine is evidentially equivalent to the production engine. A falsifiable systems claim.

This project refutes H₀.

The evidence follows.

---

# Methodology

## Background

Relationship-Based Access Control derives authorization decisions from traversable paths in a relationship graph.

Traditional RBAC asks:

> Does this permission entry exist?

ReBAC asks:

> Does a valid path currently exist between this user and this resource?

The graph changes continuously as tuples are written and removed. Conditional tuples add another dimension: whether a relationship exists depends upon engine evaluation at query time. This article concerns testing methodology for that model, not the model itself.

---

## Decision 1: Authorization Engine Infrastructure

Three approaches were evaluated.

### Shared Development Instance

Advantages:

* Real engine
* Real data
* Minimal local setup

Fatal weakness:

Shared state. A tuple written by one test persists until cleanup succeeds. A failing cleanup operation silently contaminates future runs. Test validity depends upon execution history.

The environment itself becomes part of the test.

---

### Mocked Authorization Engine

Advantages:

* Fast
* No infrastructure
* Full application-layer coverage

Fatal weakness:

The mock evaluates nothing.

Conditional relationships become hardcoded expectations.

A missing context parameter.

A malformed condition.

An unexpected engine evaluation.

None are observable.

The evidence concerns calls.

Not decisions.

---

### Real Engine via Testcontainers

Chosen approach.

A pinned production-equivalent OpenFGA image:

```
openfga/openfga:v1.15.1
```

starts automatically before test execution.

Each run begins from an empty state.

Versioning is explicit.

Infrastructure is reproducible.

Startup cost is bounded.

The evidence concerns the behavior of the authorization engine itself.

---

## Decision 2: Store Isolation

Two approaches were evaluated.

### Shared Store + Cleanup

Simple.

Fragile.

Cleanup is behavioral.

A cleanup failure leaves residual state.

Parallel execution introduces races.

A scenario may pass because another scenario previously created the required tuple.

The failure mode is invisible.

---

### Per-Class Store Isolation

Chosen approach.

`FgaTestBase` creates a dedicated store for each test class.

The authorization model is loaded into that store.

Tests inside the class share only the state they intentionally create.

Classes share nothing.

Isolation is structural.

Not procedural.

A scenario cannot inherit state it did not write.

---

## Decision 3: Tuple Generation

Two setup patterns were evaluated.

### Inline Tuple Writes

Readable.

Self-contained.

Incorrect abstraction boundary.

Production writes tuples through domain event handlers.

Inline setup bypasses those handlers entirely.

A tuple writer may be wrong while every test still passes.

---

### Event-Driven Setup

Chosen approach.

Production routes events through:

```
TupleWriterDispatcher
        ↓
ITupleWriterHandler
        ↓
OpenFGA
```

Test setup mirrors that pipeline.

Tuple structure is derived from production behavior.

A broken tuple writer breaks the adversarial scenario.

The authorization graph remains auditable.

---

## Decision 4: Test Design

Coverage metrics and adversarial scenarios were evaluated.

### Coverage-Oriented Testing

Coverage measures execution.

Coverage does not measure correctness.

A mocked authorization call and a real authorization call produce identical coverage numbers.

The metrics are indistinguishable.

The evidence is not.

---

### Named Adversarial Scenarios

Chosen approach.

Each test represents a single authorization property.

The scenario name is the claim.

The assertion is the evidence.

A failing scenario names the broken property directly.

The suite becomes a collection of proof obligations rather than a collection of executed lines.

---

# Evidence

## Exhibit A: Conditional Relationships Require Engine Evaluation

The trading card model contains a conditional relationship:

```
not_expired
```

The condition evaluates against caller-supplied context.

The T1 suite writes a delegation valid for sixty minutes.

```
WriteTuple(
    user:guardian-1,
    delegate,
    trade:t100,
    condition:not_expired {
        expiration:T+60min
    }
)
```

The tuple is exercised across both OpenFGA query boundaries.

| Query       | Time | Expected | Result  |
| ----------- | ---- | -------- | ------- |
| Check       | T+30 | Allowed  | Allowed |
| Check       | T+90 | Denied   | Denied  |
| ListObjects | T+30 | Present  | Present |
| ListObjects | T+90 | Absent   | Absent  |

The expiration timestamp exists only inside the tuple.

The application does not compare timestamps.

The caller supplies `current_time`.

The engine performs the evaluation.

The adversarial suite therefore validates the authorization model itself rather than merely validating application integration.

**Caveat**

Results characterize the OpenFGA in-memory datastore.

Postgres-backed behavior has not been evaluated.

---

## Exhibit B: The Adversarial Suite Identified a Latent Integration Gap

During development of:

```
Guardian_CannotSee_ExpiredDelegations_Via_ListObjects
```

the expected denial did not occur.

Inspection of `OpenFgaAuthorizationService` revealed an asymmetry.

`CheckAsync` supplied evaluation context.

`ListObjectsAsync` did not.

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

The omission was invisible to application-layer coverage.

Both implementations exercised identical code paths.

Only the real engine attempted to evaluate the condition.

The significance of the finding is architectural.

The adversarial suite identified an authorization integration defect before any production feature depended upon the affected path.

A mocked authorization engine configured with expected return values would have reported complete success.

---

## Exhibit C: Snapshot Semantics Are Preserved

The authorization model intentionally captures supervision relationships at trade proposal time.

Sequence:

```
T=0
Delegation granted.

T=1
Trade proposed.
Supervisor tuple written.

T=2
Delegation expires.

T=180
Supervisor queries trade.
```

Expected:

```
Allowed
```

Observed:

```
Allowed
```

The model therefore implements snapshot semantics rather than continuously recomputing authorization from current delegation state.

This property exists as a named adversarial scenario.

Future modifications that alter this invariant produce a failing specification before deployment.

**Caveat**

This demonstrates one temporal invariant.

It is not a proof of complete temporal correctness.

---

## Exhibit D: Structural Isolation Scales

The T1 remediation added two new scenarios.

| Stage  | Tests | Failures | Fixture Changes |
| ------ | ----- | -------- | --------------- |
| Before | 323   | 0        | N/A             |
| After  | 325   | 0        | 0               |

No changes were required to:

* FgaTestBase
* OpenFgaFixture
* Store lifecycle management
* Container management

Per-class isolation scales by local extension.

Adding a scenario extends the local proof set.

Adding a new class creates a new isolated store.

Neither operation modifies shared infrastructure.

The property is observable directly from the fixture architecture.

---

# QED

The T1 result was not that a production bug was found.

The T1 result was that a real authorization engine and a mocked authorization engine are not evidentially equivalent once conditional relationships enter the model.

One omitted context parameter left `not_expired` unevaluable at the `ListObjects` boundary.

The adversarial suite identified the gap before any production feature depended upon it.

A mocked suite with identical application-layer coverage would have achieved identical coverage metrics while observing no difference.

That is the distinction between testing calls and testing decisions.

The fixture architecture survived the remediation unchanged.

Two additional scenarios extended the proof set without modifying shared infrastructure.

The model grew locally.

The limitations remain.

Three hundred twenty-five tests across twenty-five named authorization properties do not constitute formal verification.

Postgres-backed behavior has not been characterized.

Unnamed scenarios may still exist.

The evidence supports a partial refutation of H₀.

For conditional relationships, a mocked authorization engine is not evidentially equivalent to the production engine.

The T1 result demonstrates the practical consequence.

∎

---

# Appendix

## Terms

### Relationship-Based Access Control (ReBAC)

An authorization paradigm in which access decisions derive from traversable paths in a relationship graph rather than static role assignments.

---

### OpenFGA

An implementation of the Google Zanzibar authorization model.

Authorization state consists of tuples.

Authorization decisions are computed by traversing those tuples against a DSL-defined model.

---

### Tuple

The atomic unit of authorization state.

```
(user, relation, object)
```

Conditional tuples extend that assertion with evaluation rules executed by the engine.

---

### `not_expired`

A conditional relationship evaluated by OpenFGA using:

```
current_time < expiration
```

The comparison occurs inside the engine.

The application supplies context.

It does not perform the evaluation itself.

---

### Check vs ListObjects

`Check`

> Does user U have relation R on object O?

`ListObjects`

> Return every object of type T for which user U has relation R.

Both require identical evaluation context for conditional relationships.

---

### Testcontainers

A testing library that provisions Docker containers automatically during test execution.

The adversarial suite uses Testcontainers to create a reproducible production-equivalent OpenFGA environment for every test run.
