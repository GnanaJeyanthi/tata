# AutoTwin Edge 🚗✈️🚜
### Physics-Informed Digital Twins & Edge AI Diagnostics for Automotive, Aerospace, and Industrial Heavy Machinery
*Submitted for **Tata InnoVent-27** — Theme: AI at the Edge*

---

## 📌 Project Overview
**AutoTwin Edge** is an advanced engineering twin platform designed to predict component degradation, estimate Remaining Useful Life (RUL), and detect mechanical/electrical anomalies *at the Edge*. 

By embedding deep physical reliability laws directly into the loss function of lightweight neural networks, AutoTwin operates with extreme resource efficiency on low-power microcontrollers onboard vehicles, drones, and heavy machinery.

### 🌟 Key Innovations
1. **Physics-Informed Loss Functions (PINNs):** Integrates mass diffusion and thermal conservation equations to restrict predictions within valid engineering bounds.
2. **Onboard CAN Bus Frame Decoders:** Simulates real-time ingestion of hex CAN packets from vehicle internal networks.
3. **Explainable AI (XAI) Attribution:** Calculates SHAP/LIME-style factor attributions so field mechanics can instantly understand the root cause of predicted faults.
4. **Economic What-If Simulator:** Stress-tests assets under variable payloads, ambient temperatures, and operation hours to calculate expected repair costs and CO2 footprints.

---

## 🧠 Machine Learning Architecture

```
                                  +------------------------------+
                                  |    Onboard Sensors (Edge)    |
                                  +--------------+---------------+
                                                 | (CAN Bus Hex Stream)
                                                 v
                                  +--------------+---------------+
                                  |   CAN Frame Decoder (Edge)   |
                                  +--------------+---------------+
                                                 | [Temp, Vibration, Volts]
                                                 v
   +---------------------------------------------+---------------------------------------------+
   |                                    Edge Inference Engine                                  |
   |                                                                                           |
   |  +-----------------------------+                           +----------------------------+  |
   |  |   Data Loss Calculation     |                           |    Physics-Informed Loss   |  |
   |  |  (MSE on Telemetry Targets) |                           | (Fick's & Heat Equations)  |  |
   |  +--------------+--------------+                           +-------------+--------------+  |
   |                 |                                                        |                |
   |                 +----------------------------+---------------------------+                |
   |                                              |                                            |
   |                                              v                                            |
   |                              Loss = L_data + lambda * L_physics                           |
   |                                              |                                            |
   |                                              v                                            |
   |                                    Optimized Weights                                      |
   +----------------------------------------------+--------------------------------------------+
                                                  |
                                                  | (Low-Bandwidth Summary Upload)
                                                  v
                                  +--------------+---------------+
                                  |    Cloud Fleet Management    |
                                  | (Dashboard, Recommendations) |
                                  +------------------------------+
```

### A. Mathematical PDE Constraints
* **Battery Capacity Loss (Fick's Diffusion Law):**
  $$\frac{\partial C}{\partial t} = D \nabla^2 C \implies \frac{d(\text{SOH})}{dn} = -\frac{k_{\text{degrade}}}{\sqrt{n + \epsilon}}$$
  Penalizes the neural network if predicted capacity fade deviates from empirical chemical mass transfer rules over discharge cycles $n$.
* **Motor Thermal Conservation (Newton's Law of Cooling):**
  $$m c_p \frac{dT}{dt} = I^2 R_{\text{int}} - h(T - T_{\text{ambient}})$$
  Ensures predicted heat generation matches mechanical/electrical energy loss minus coolant dissipation.

---

## 🛠️ Target Sector Deployments (InnoVent-27 Alignment)

### 1. Automotive (Tata Nexon EV Max, Jaguar I-PACE)
* **Edge Metrics:** Battery SOH degradation, braking calliper pad wear, power inverter surge voltage, tire tread depth.
* **Tata Ziptron Integration:** Connects with the EV Battery Management System (BMS) to run real-time cell impedance forecasting.

### 2. Industrial Heavy Machinery (Tata Prima Electric Heavy Truck)
* **Edge Metrics:** Powertrain shaft alignment vibration, high-load mechanical torque wear, heavy payload brake temperatures.
* **Tata Commercial Vehicles Synergy:** Extends Tata Motors' *Fleet Edge* telemetry system to predict catastrophic axle and motor lockups.

### 3. Aerospace (AeroTwin Delivery Drone eVTOL)
* **Edge Metrics:** Stator high-frequency vibrations, eVTOL vertical lift discharge curves, structural fatigue alerts.
* **Aviation MRO Platform:** Leverages digital twins to transition drone flight log audits to predictive MRO (Maintenance, Repair, and Overhaul).

---

## 💻 Technical Stack & Edge Deployment

* **Edge Runtimes:** **TensorFlow Lite for Microcontrollers** (TFLite-Micro) / **ONNX Runtime Micro** compiled to C++ binaries.
* **Edge Hardware Targets:** 
  * **ARM Cortex-M7** microcontrollers (onboard automotive telematics controllers).
  * **NXP S32G2** vehicle network processor (decoding multi-channel J1939 CAN logs).
  * **NVIDIA Jetson Nano** (running heavy industrial machinery bearing vibration spectrogram classifiers).
* **Cloud Platform:** Node.js/Express, React, Vite, MongoDB / In-memory fallback DB.

---

## 🚀 Running the Project

### Prerequisites
* Node.js (v18+)
* Python 3.10+ (for model mathematical verification)

### 1. Installation
Clone the repository and install packages in both root and backend:
```bash
# Install frontend packages
npm install

# Install backend packages
cd backend
npm install
```

### 2. Math & Physics Verification
To execute the PyTorch/NumPy physics solver and verify loss convergence equations:
```bash
python backend/ml/edge_pinn_model.py
```

### 3. Run Locally
To spin up the local development servers:
```bash
# Start Node.js backend (from /backend folder)
npm run dev

# Start Vite React frontend (from root folder in another terminal)
npm run dev
```

*Frontend runs at `http://localhost:5173`. Backend runs at `http://localhost:5000`.*
