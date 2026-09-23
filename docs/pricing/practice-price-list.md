# Practice price list

The practice's printed surgical price sheet, transcribed from two photos
taken on **2026-09-15** (11:13 and 11:13:52 local), shared by the owner's team
for the liposuction page rebuild on 2026-09-22.

- Prices are in US dollars, exactly as printed. Add-ons are priced on top of
  another procedure, not as surgeries on their own.
- Someone has handwritten **"20% off"** at the top of page 1. The sheet doesn't
  say whether its figures are before or after that discount. The BBL price the
  site adopted on 2026-09-15, $5,500 (Lipo 360 + BBL below), matches the
  printed figure, so these read as list prices. Confirm with the practice
  before publishing a discounted figure.
- Pen and pencil ticks sit beside a few prices (breast lift without implants,
  breast lift with saline, implant exchange with saline, extended tummy tuck,
  both arm lifts). They aren't explained, so they're recorded here as marks
  only.
- Procedure names keep the sheet's wording and spelling.

## Face

| Procedure            |  Price |
| -------------------- | -----: |
| Blepharoplasty Upper |  3,500 |
| Blepharoplasty Lower |  3,500 |
| Blepharoplasty BOTH  |  6,500 |
| Face & Neck Lift     | 15,000 |
| Fat Grafting to Face |  1,500 |
| Otoplasty            |  4,500 |
| TCA Peel             |  1,000 |
| Lip Lift             |  1,500 |
| Brow Lift            |  8,500 |

## Breast

| Procedure                                            |          Price | Mark |
| ---------------------------------------------------- | -------------: | ---- |
| Breast Augmentation - Saline                         |          3,500 |      |
| Breast Augmentation - Silicone                       |          4,500 |      |
| Breast Lift - NO IMPLANTS                            |          5,000 | tick |
| Breast Lift - Saline                                 |          6,000 | tick |
| Breast Lift - Silicone                               |          7,000 |      |
| Breast Lift - Modified (only skin from below areola) |          4,000 |      |
| Reduction - SM-MED                                   |          6,000 |      |
| Reduction - LG                                       |          8,000 |      |
| Reduction - Ex LG                                    |          9,000 |      |
| Reduction - Male Patient                             |          6,000 |      |
| Implant Removal (stand alone procedure) - RARE       |          3,000 |      |
| Implant Removal (added to another breast procedure)  | 500 per breast |      |
| Implant Exchange - Saline                            |          3,500 | tick |
| Implant Exchange - Silicone                          |          4,500 |      |
| Capsulectomy/Capsulorophy                            | 500 per breast |      |
| Fat Grafting to Breasts                              |          1,500 |      |
| Axillary Skin Excision (add on)                      |          1,500 |      |
| Inframmamory Crease Repair (add on)                  | 500 per breast |      |
| Double Bubble Repair (add on)                        | 500 per breast |      |

## Body

| Procedure                                                           |  Price | Mark |
| ------------------------------------------------------------------- | -----: | ---- |
| Lipo 360                                                            |  4,000 |      |
| Lipo 360 + BBL                                                      |  5,500 |      |
| Tummy Tuck - Mini (no muscle repair)                                |  3,000 |      |
| Tummy Tuck - Extended Mini (no muscle repair, hip to hip incision)  |  4,000 |      |
| Tummy Tuck - Regular (loose skin doesn't extend to the hips)        |  4,500 |      |
| Tummy Tuck - Extended (hip to hip incision)                         |  5,500 | tick |
| Fleur de Lis Tummy Tuck                                             | 10,000 |      |
| Back Lift w/ Back Lipo (all patients need lipo back with back lift) |  8,000 |      |
| Arm Lift w/o Lipo (all loose, empty skin)                           |  5,000 | tick |
| Arm Lift w/ Arm Lipo                                                |  6,000 | tick |
| Thigh Lift - Medial w/o Lipo                                        |  8,000 |      |
| Thigh Lift - Medial w/ Lipo Inner Thighs                            |  8,800 |      |
| Thigh Lift Medial & Vertical w/o Lipo                               | 10,000 |      |
| Thigh Lift Medial & Vertical w/ Lipo Inner Thighs                   | 10,800 |      |

## Male

| Procedure                                       | Price |
| ----------------------------------------------- | ----: |
| Chest Lipo (combined w/ another procedure)      | 1,000 |
| Gynecomastia (excision of gland and chest lipo) | 4,500 |
| Breast Lift w/ Gynecomastia                     | 5,500 |
| Breast Reduction                                | 6,000 |

## Combination discounts

| Combination       | Discount |
| ----------------- | -------: |
| 2 procedure combo |     −500 |
| 3 procedure combo |   −1,000 |

## Add-ons

Priced on top of another procedure.

| Add-on                                          |                                  Price |
| ----------------------------------------------- | -------------------------------------: |
| J-plasma                                        | 1,000 first area / 500 each additional |
| Lipo Full Back/Flanks                           |                                  1,500 |
| Lipo Abdomen/Flanks                             |                                  1,500 |
| Lipo Arms                                       |                                  1,000 |
| Lipo Inner Thighs                               |                                    800 |
| Lipo Outer Thighs                               |                                    800 |
| Lipo Pubic                                      |                                    500 |
| Lipo Axillary                                   |                                    600 |
| Lipo Chin                                       |                                    500 |
| Lipo Buffalo Hump (only add to back procedures) |                                    500 |
| Lipo Banana Rolls (only add to back procedures) |                                    500 |
| Lipo Hips                                       |                                    800 |

Page 2 was photographed at an angle. Each add-on price was matched to its row
by following the row's tilt across all three columns, and the counts agree
(12 names, 12 "ADD ON" cells, 12 prices).

## Against what the site says (2026-09-22)

The "starting at" figure each procedure data file publishes
(`apps/web/lib/data/procedures/*.data.ts`, `priceFrom`), next to the lowest
price on the sheet for the same procedure. The weekly payment figures the
site also publishes aren't on the sheet.

| Page                | Site says                       | Sheet's lowest price               | Agrees?                          |
| ------------------- | ------------------------------- | ---------------------------------- | -------------------------------- |
| Liposuction         | $4,500 (quiz: $3,000–$7,000)    | $4,000 (Lipo 360)                  | No                               |
| BBL                 | $5,500, most pay $5,500–$10,000 | $5,500 (Lipo 360 + BBL)            | Yes                              |
| Tummy tuck          | $5,500 (`description`: $3,500)  | $3,000 (mini)                      | No                               |
| Breast augmentation | $4,500                          | $3,500 (saline); $4,500 (silicone) | Only for silicone                |
| Breast lift         | $6,500                          | $5,000 (no implants)               | No                               |
| Breast reduction    | $6,500                          | $6,000 (small to medium)           | No                               |
| Facelift            | $11,500                         | $15,000 (face and neck lift)       | No                               |
| Blepharoplasty      | $3,500                          | $3,500 (upper or lower)            | Yes                              |
| Mommy makeover      | $9,500                          | Not on the sheet                   | A combination; see the discounts |

Correcting these is issue #232's scope. Only liposuction changes with the
liposuction page rebuild.

## Open questions for the practice

1. Is the "20% off" a current promotion applied to these prices, or have the
   printed prices already been discounted?
2. Is Lipo 360 the only standalone liposuction? Is single-area lipo (chin,
   arms, thighs) ever done on its own, and at what price?
3. What does a price include: anesthesia, the facility, the garment,
   follow-up visits?
4. What do the pen and pencil ticks mean?
