# ？チップ artwork

Source: Google Drive game specification, addendum v1.3 (2026-10-09), document 1H6aJNt63o00nhQu1CGSqzaCKIHeQ8wFbJTsGZU9y5Zk.

Gold hexagon, dark brown-gold outline, bright yellow face, stationary dark question mark. 16×16 logical pixels (increased from ~12px for legibility), transparent RGBA sheet 64×16. Four frames retain the identical silhouette and question mark; a short edge glint appears once per two seconds. No blur or palette conversion. Position retains the old chip center; collection and score are unchanged.

Rebuild: `node games/ary/tools/build-chip.cjs` with @napi-rs/canvas. The PNG is read directly at runtime. Optional-image failure uses the existing hexagon drawing without blocking play.

Production-intended artwork is currently deployed only on the development branch, pending user visual acceptance and mobile checks.
