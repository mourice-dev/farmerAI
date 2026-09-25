# Model Evaluation Report

- **Date:** 2026-05-19 12:21:36
- **Model:** `plant_disease_efficientnet.keras`
- **Total Images:** 511
- **Overall Accuracy:** **41.68%**

## Summary Metrics

| Metric | Value |
| :--- | :--- |
| Total Images | 511 |
| Correct Predictions | 213 |
| Accuracy | 41.68% |

## Classification Report

```text
                                                    precision    recall  f1-score   support

                                Apple___Apple_scab      0.421     0.533     0.471        15
                                 Apple___Black_rot      0.200     0.067     0.100        15
                          Apple___Cedar_apple_rust      0.429     0.214     0.286        14
                                   Apple___healthy      0.200     0.214     0.207        14
                               Blueberry___healthy      0.292     0.412     0.341        17
          Cherry_(including_sour)___Powdery_mildew      0.700     0.583     0.636        12
                 Cherry_(including_sour)___healthy      0.300     0.231     0.261        13
Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot      0.579     0.786     0.667        14
                       Corn_(maize)___Common_rust_      0.571     0.286     0.381        14
               Corn_(maize)___Northern_Leaf_Blight      0.500     0.571     0.533        14
                            Corn_(maize)___healthy      0.444     0.333     0.381        12
                                 Grape___Black_rot      0.409     0.643     0.500        14
                      Grape___Esca_(Black_Measles)      0.733     0.733     0.733        15
        Grape___Leaf_blight_(Isariopsis_Leaf_Spot)      0.385     0.455     0.417        11
                                   Grape___healthy      0.750     0.643     0.692        14
          Orange___Haunglongbing_(Citrus_greening)      1.000     0.385     0.556        13
                            Peach___Bacterial_spot      0.300     0.500     0.375        12
                                   Peach___healthy      0.000     0.000     0.000        10
                     Pepper,_bell___Bacterial_spot      0.476     0.714     0.571        14
                            Pepper,_bell___healthy      0.600     0.692     0.643        13
                             Potato___Early_blight      0.500     0.533     0.516        15
                              Potato___Late_blight      0.700     0.467     0.560        15
                                  Potato___healthy      0.875     0.438     0.583        16
                               Raspberry___healthy      0.667     0.333     0.444        12
                                 Soybean___healthy      0.333     0.231     0.273        13
                           Squash___Powdery_mildew      0.733     0.688     0.710        16
                          Strawberry___Leaf_scorch      0.478     0.846     0.611        13
                              Strawberry___healthy      0.625     0.417     0.500        12
                           Tomato___Bacterial_spot      0.375     0.214     0.273        14
                             Tomato___Early_blight      0.179     0.385     0.244        13
                              Tomato___Late_blight      0.231     0.692     0.346        13
                                Tomato___Leaf_Mold      0.500     0.077     0.133        13
                       Tomato___Septoria_leaf_spot      0.175     0.538     0.264        13
     Tomato___Spider_mites Two-spotted_spider_mite      0.000     0.000     0.000        11
                              Tomato___Target_Spot      0.000     0.000     0.000        11
            Tomato___Tomato_Yellow_Leaf_Curl_Virus      0.348     0.533     0.421        15
                      Tomato___Tomato_mosaic_virus      0.000     0.000     0.000        11
                                  Tomato___healthy      0.143     0.067     0.091        15

                                          accuracy                          0.417       511
                                         macro avg      0.425     0.407     0.387       511
                                      weighted avg      0.436     0.417     0.398       511

```

## Confusion Matrix

![Confusion Matrix](evaluation_confusion_matrix.png)

