# Style Intelligence Recommendation Engine

This document details the scoring formulas, weight configurations, evaluation constraints, and coordinate assembly algorithms inside the **Style Intelligence Engine**.

---

## 🎚️ Weight Distributions

The [ScoringEngine](file:///Users/priyanshudutta/Desktop/DripAi/src/services/intelligence/ScoringEngine.ts) scores standardized product items against the extracted `StyleBlueprint` using a weighted index.

| Evaluation Dimension | Default Weight | Description |
| :--- | :--- | :--- |
| **Occasion Compatibility** | `0.20` | Checks product `occasionTags` against target blueprint occasion. |
| **Style Genre Match** | `0.20` | Evaluates canonical styling (e.g. streetwear, casual, minimalist). |
| **Color Harmony** | `0.15` | Measures color matching suitability (exact matches vs. neutral coordinates). |
| **Fit Compatibility** | `0.15` | Ensures clothing cuts align with preferences (regular, slim, oversized). |
| **Season Suitability** | `0.10` | Checks catalog seasons. 'All-season' matches are favored. |
| **Budget Compliance** | `0.10` | Score decays if item exceeds target category budget thresholds. |
| **Gender Alignment** | `0.10` | Hard constraint. Incorrect gender targets return a score of 0. |

---

## 🧮 Core Formula Dynamics

### 1. Hard Constraints
- **Gender Constraint**: If the target gender does not match the product target (unless product is `unisex`), the item is immediately disqualified (score = `0`).
- **Score Summation**: Compatibility is calculated as:
  $$\text{Compatibility Score} = \left( \frac{\sum (\text{Dimension Score} \times \text{Dimension Weight})}{\sum \text{Weights}} \right) \times 100$$

### 2. Budget Allocation Fractions
To score item budgets dynamically without knowing other outfit parts, the overall budget limit is partitioned into discrete category allowances:
- **Tops**: 35% of overall budget
- **Bottoms**: 35% of overall budget
- **Shoes**: 20% of overall budget
- **Accessories**: 10% of overall budget

### 3. Linear Price Decay
If an item's price exceeds its category allowance ($L$), the score decays linearly up to $2L$, above which it drops to `0`:
$$\text{Budget Score} = 1.0 - \frac{\text{Price} - L}{2L - L}$$

---

## 👔 Coordinate Assembly Pipeline

1. **Retrieved Catalog**: Products are fetched, normalized, and consolidated at the repository boundary.
2. **Standard Scoring**: Every candidate is evaluated by the scoring function and grouped into categories.
3. **Category Ranking**: Candidates inside `top`, `bottom`, `shoes`, and `accessories` are sorted descending by score.
4. **Coordinate Bundling**:
   - **Best Match**: Combines the rank-1 item from all four categories.
   - **Alternative Look**: Pairs the rank-2 items (or rank-1 if catalog is small) to form a complete alternative coordinate.
   - **Budget-Friendly**: Filters candidates with compatibility > 30%, sorts them ascending by price, and bundles the cheapest option from each category.
