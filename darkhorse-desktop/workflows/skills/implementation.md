# Skill: Approved A1 Implementation

## Authority

Implementation scope comes only from the current approved A1. Desktop work-item labels cannot authorize work or prove completion.

## Method

1. Invoke installed Darkhorse `implement <change-id>` for the selected generated project.
2. Stop on stale/missing A1, projection drift, incompatible VEP, or any nonzero result.
3. Implement only the verified A1 subject and acceptance scope.
4. Invoke installed Darkhorse `test`, then `review`, preserving exact VEP semantics.
5. Invoke `close` only as a governed request. VEP alone decides Close eligibility; Desktop never archives or marks lifecycle complete itself.
