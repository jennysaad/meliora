import React, { useState } from "react";
import {
  Upload,
  Menu,
  Settings,
  Heart,
  Brain,
  Smile,
  BarChart3,
  TrendingUp,
  Info,
  Home as HomeIcon,
  BookOpen,
} from "lucide-react";
import { GrandparentIcon } from "./components/grandparent-icon";
import { CloudSmile } from "./components/cloud-smile";
import { motion } from "motion/react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";

type ModelType = "catboost" | "xgboost" | "lightgbm" | "random_forest" | null;
type TabType = "home" | "about";

interface PredictionResult {
  subject: string;
  prediction: string;
  confidence: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [selectedModel, setSelectedModel] = useState<ModelType>("xgboost");
  const [uploadedFiles, setUploadedFiles] = useState<FileList | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult[] | null>(null);
  // const [showResults, setShowResults] = useState(false);
  // const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadedFiles(e.target.files);
    // if (e.target.files && e.target.files[0]) {
    //   setUploadedFile(e.target.files[0]);
    //   // Mock data preview
    //   setUploadedData([
    //     { id: 1, age: 65, mmse: 24, memory_score: 3.2, education: 16 },
    //     { id: 2, age: 72, mmse: 21, memory_score: 2.8, education: 12 },
    //     { id: 3, age: 68, mmse: 26, memory_score: 3.5, education: 18 },
    //     { id: 4, age: 70, mmse: 22, memory_score: 2.9, education: 14 },
    //     { id: 5, age: 75, mmse: 19, memory_score: 2.3, education: 10 },
    //   ]);
    // }
  };

  // const handlePredict = () => {
  //   if (!uploadedFile || !selectedModel) return;

  const runPrediction = async (model: ModelType, files: FileList) => {
    if (!model) return;
    setLoading(true);
    setError(null);
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append("files", f));
    formData.append("model", model);
    try {
      const res = await fetch("http://localhost:5000/predict", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Prediction failed");
      setPrediction(data.results);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = () => {
    if (uploadedFiles) runPrediction(selectedModel, uploadedFiles);
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const model = e.target.value as ModelType;
    setSelectedModel(model);
    if (prediction && uploadedFiles) runPrediction(model, uploadedFiles);
  };


    // // Mock prediction
    // setTimeout(() => {
    //   const mockConfidence = Math.random() * 40 + 60;
    //   setPrediction({
    //     prediction: mockConfidence > 75 ? "Low Risk" : "Moderate Risk",
    //     confidence: mockConfidence,
    //   });
    //   setShowResults(true);
    // }, 1000);
  // };

  // Mock data for charts
  const accuracyData = [
    { model: "CatBoost", accuracy: 62 },
    { model: "XGBoost", accuracy: 75 },
    { model: "LightGBM", accuracy: 62 },
    { model: "Random Forest", accuracy: 50 },
  ];

  // Performance metrics for each model (from the provided table)
  const performanceData = [
    {
      model: "xgboost",
      Accuracy: 0.75,
      F1: 0.5,
      AUC: 0.9972,
    },
    {
      model: "catboost",
      Accuracy: 0.625,
      F1: 0.4,
      AUC: 0.9992,
    },
    {
      model: "random_forest",
      Accuracy: 0.5,
      F1: 0.3333,
      AUC: 0.9994,
    },
    {
      model: "lightgbm",
      Accuracy: 0.625,
      F1: 0.4,
      AUC: 0.9983,
    },
  ];

  const pieData = [
    { name: "Low Risk", value: 65 },
    { name: "Moderate Risk", value: 25 },
    { name: "High Risk", value: 10 },
  ];

  const COLORS = ["#957C62", "#E2B59A", "#B77466"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary border-b-4 border-accent">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-center items-center">
              <div className="flex items-center justify-center mx-auto">
                <h1
                  className="text-3xl font-extrabold text-white tracking-wide text-center"
                  style={{
                    fontFamily: "Georgia, serif",
                    letterSpacing: "0.04em",
                  }}
                >
                  Nana
                </h1>
                <ImageWithFallback
                  src={"/src/app/components/LogoTransparent.png"}
                  alt="Nana Logo"
                  className="w-24 h-24 object-contain inline-block align-middle ml-0.5"
                  style={{ marginTop: -2 }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("home")}
                className={`px-4 py-1 rounded text-sm transition-colors ${
                  activeTab === "home"
                    ? "bg-white text-primary"
                    : "bg-transparent text-white border border-white/40 hover:bg-white/10"
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveTab("about")}
                className={`px-4 py-1 rounded text-sm transition-colors ${
                  activeTab === "about"
                    ? "bg-white text-primary"
                    : "bg-transparent text-white border border-white/40 hover:bg-white/10"
                }`}
              >
                About
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <main className="flex-1">
          {activeTab === "home" && (
            <div className="space-y-8">
              {/* Upload Section */}
              <section className="text-center">
                <h2 className="text-2xl mb-6">
                  Upload your file to check for Alzheimer's!
                </h2>

                <div className="flex items-center justify-center gap-4 mb-4 flex-wrap">
                  <label
                    htmlFor="file-upload"
                    className="px-8 py-3 bg-secondary text-foreground border-2 border-accent cursor-pointer text-sm hover:bg-secondary/70"
                  >
                    <Upload className="w-4 h-4 inline mr-2" />
                    {uploadedFiles ? `${uploadedFiles.length} file(s) selected` : "Upload Your Data"}
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".npy"
                    multiple
                    // @ts-ignore: webkitdirectory is a valid attribute for folder upload in browsers
                    webkitdirectory="true"
                    // @ts-ignore: directory is a valid attribute for folder upload in browsers
                    directory="true"
                  />

                  <button
                      onClick={handlePredict}
                      disabled={!uploadedFiles || loading}
                      className="px-8 py-3 bg-primary text-white border-2 border-primary hover:bg-primary/80 text-sm disabled:opacity-50"
                    >
                      {loading ? "Predicting..." : "Predict"}
                    </button>

                  <select
                    value={selectedModel || ""}
                    onChange={handleModelChange}
                    className="px-4 py-3 bg-white border-2 border-accent text-xs text-foreground cursor-pointer"
                  >
                    <option value="catboost">CatBoost</option>
                    <option value="xgboost">XGBoost</option>
                    <option value="lightgbm">LightGBM</option>
                    <option value="random_forest">Random Forest</option>
                  </select>
                </div>

                {/* Data Preview */}
                {/* {uploadedData.length > 0 && (
                  <div className="bg-white border-2 border-primary p-4">
                    <h3 className="mb-3 text-sm">Data Preview</h3>
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-muted/30">
                          <th className="text-left p-2 border border-border">
                            ID
                          </th>
                          <th className="text-left p-2 border border-border">
                            Age
                          </th>
                          <th className="text-left p-2 border border-border">
                            MMSE
                          </th>
                          <th className="text-left p-2 border border-border">
                            Memory
                          </th>
                          <th className="text-left p-2 border border-border">
                            Education
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {uploadedData.map((row) => (
                          <tr key={row.id}>
                            <td className="p-2 border border-border">
                              {row.id}
                            </td>
                            <td className="p-2 border border-border">
                              {row.age}
                            </td>
                            <td className="p-2 border border-border">
                              {row.mmse}
                            </td>
                            <td className="p-2 border border-border">
                              {row.memory_score}
                            </td>
                            <td className="p-2 border border-border">
                              {row.education}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )} */}

              </section>

              {/* Space for icons */}
              <div className="py-4"></div>

              {/* Results Section */}
              <section className="relative">
                {/* GrandmaCane image above the results box border, slightly more distance from the box */}
                <div
                  className="absolute left-[13%] -translate-x-1/2 -top-14 z-10 hidden md:block"
                  style={{ pointerEvents: "none" }}
                >
                  <ImageWithFallback
                    src={"/src/app/components/GrandmaCaneTransparent.png"}
                    alt="Grandma Cane walking"
                    className="w-28 h-auto drop-shadow-lg"
                  />
                </div>
                <div className="bg-white border-2 border-primary p-6 min-h-[180px] flex items-center justify-center relative">
                  {error ? (
                      <p className="text-destructive text-sm">{error}</p>
                    ) : prediction ? (
                      <div className="w-full">
                        <h3 className="text-center mb-4 text-lg">Results</h3>
                        <table className="w-full text-xs border-collapse">
                          <thead>
                            <tr className="bg-muted/30">
                              <th className="text-left p-2 border border-border">Subject</th>
                              <th className="text-left p-2 border border-border">Prediction</th>
                              <th className="text-left p-2 border border-border">Confidence</th>
                            </tr>
                          </thead>
                          <tbody>
                            {prediction.map((r) => (
                              <tr key={r.subject}>
                                <td className="p-2 border border-border">{r.subject}</td>
                                <td className="p-2 border border-border">{r.prediction}</td>
                                <td className="p-2 border border-border">{r.confidence.toFixed(1)}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-sm">
                        <p>Results will appear here after analysis</p>
                      </div>
                    )}
                </div>
              </section>

              {/* Stats & Graphs */}
              <section>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Stats Chart */}
                  <div className="bg-white border-2 border-accent p-4">
                    <h3 className="mb-4 text-sm">
                      <BarChart3 className="w-4 h-4 inline mr-2 text-primary" />
                      Performance Metrics
                    </h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart
                        data={performanceData}
                        margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                        barCategoryGap={"20%"}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(151, 124, 98, 0.2)"
                        />
                        <XAxis
                          dataKey="model"
                          stroke="#4A4A4A"
                          fontSize={10}
                          tick={{ fontFamily: "monospace" }}
                        />
                        <YAxis
                          stroke="#4A4A4A"
                          fontSize={10}
                          domain={[0, 1]}
                          tickFormatter={(v) => v.toFixed(2)}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "2px solid #957C62",
                            fontSize: "11px",
                          }}
                          formatter={(value) =>
                            typeof value === "number" ? value.toFixed(4) : value
                          }
                        />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar
                          dataKey="Accuracy"
                          fill="#B77466"
                          name="Accuracy"
                        />
                        <Bar dataKey="F1" fill="#957C62" name="F1" />
                        <Bar dataKey="AUC" fill="#E2B59A" name="AUC" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Accuracy Chart */}
                  <div className="bg-white border-2 border-accent p-4">
                    <h3 className="mb-4 text-sm">
                      <TrendingUp className="w-4 h-4 inline mr-2 text-accent" />
                      Model Accuracy
                    </h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={accuracyData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(151, 124, 98, 0.2)"
                        />
                        <XAxis dataKey="model" stroke="#4A4A4A" fontSize={10} />
                        <YAxis
                          stroke="#4A4A4A"
                          fontSize={10}
                          domain={[80, 100]}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "2px solid #957C62",
                            fontSize: "11px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="accuracy"
                          stroke="#957C62"
                          strokeWidth={3}
                          dot={{
                            fill: "#957C62",
                            r: 5,
                            strokeWidth: 2,
                            stroke: "#fff",
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>

              {/* Info Section */}
              <section>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Early Warning Signs */}
                  <div>
                    <h3 className="mb-4 text-sm">
                      <Heart className="w-4 h-4 inline mr-2 text-destructive" />
                      Early Warning Signs
                    </h3>
                    <ul className="space-y-2 text-xs">
                      <li>• Memory loss that disrupts daily life</li>
                      <li>• Challenges in planning or solving problems</li>
                      <li>• Difficulty completing familiar tasks</li>
                      <li>• Confusion with time or place</li>
                      <li>• Changes in mood and personality</li>
                    </ul>
                  </div>

                  {/* Support Section */}
                  <div>
                    <h3 className="mb-4 text-sm">
                      <Smile className="w-4 h-4 inline mr-2 text-secondary" />
                      Support & Resources
                    </h3>
                    <ul className="space-y-2 text-xs">
                      <li>• Talk to your healthcare provider</li>
                      <li>• Stay mentally and physically active</li>
                      <li>• Connect with support groups</li>
                      <li>• Join the Alzheimer's Association</li>
                    </ul>
                  </div>
                </div>
              </section>
            </div>
          )}

{activeTab === "about" && (
            <div className="space-y-8">
              {/* Dataset */}
              <section>
                <div className="bg-white border-2 border-primary p-6">
                  <h2 className="mb-4 flex items-center gap-2 text-lg">
                    <Brain className="w-5 h-5 text-primary" />
                    Dataset
                  </h2>
                  <div className="space-y-3 text-sm">
                    <p>
                      An EEG records electrical brain activity through
                      electrodes on the scalp.
                    </p>
                    <p>
                      We work with recordings from{" "}
                      <strong>65 subjects</strong>: 36 with Alzheimer's
                      (AD) and 29 healthy controls (CN). Each recording has
                      19 electrodes across the scalp (10-20 layout), sampled
                      at 500 Hz. Recordings range from 5 to 21 minutes. We
                      train on 38 subjects (25 AD, 13 CN) and hold out the
                      rest for testing.
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-3 mt-4">
                    {[
                      { val: "65", label: "Subjects Used" },
                      { val: "19", label: "EEG Channels" },
                      { val: "500 Hz", label: "Sample Rate" },
                      { val: "38", label: "Training Subjects" },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="text-center p-3 bg-muted/20 border border-border"
                      >
                        <p className="text-lg font-bold text-primary">{s.val}</p>
                        <p className="text-[10px] text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>
 
                  {/* Class Distribution Pie Chart */}
                  <div className="mt-4">
                    <p className="text-xs font-bold mb-2">
                      Training Set Class Distribution
                    </p>
                    <div className="flex items-center justify-center gap-8">
                      <ResponsiveContainer width="50%" height={180}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: "AD (25)", value: 25 },
                              { name: "CN (13)", value: 13 },
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={70}
                            dataKey="value"
                            label={({ name }: { name: string }) => name}
                            labelLine={true}
                          >
                            <Cell fill="#B77466" />
                            <Cell fill="#E2B59A" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="text-xs text-muted-foreground">
                        <p>
                          Almost 2:1 ratio of AD to CN. Without class
                          balancing, a model could just predict "AD" for
                          everyone and get 66% accuracy without learning
                          anything.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
 
              {/* Pipeline */}
              <section>
                <div className="bg-white border-2 border-accent p-6">
                  <h3 className="mb-2 text-sm">
                    <BarChart3 className="w-4 h-4 inline mr-2 text-accent" />
                    Pipeline
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Raw EEG goes in, a single AD or CN prediction comes out.
                    Each step is its own script so we can run and debug them
                    independently.
                  </p>
                  <div className="flex items-center justify-between gap-1 mb-6">
                    {[
                      { step: "Raw EEG", detail: ".npy files\n19 × T" },
                      { step: "Window", detail: "30s windows\n15s overlap" },
                      { step: "Downsample", detail: "500 → 128 Hz" },
                      { step: "Features", detail: "RBP + SCC\n380 dims" },
                      { step: "XGBoost", detail: "Classify\nper window" },
                      { step: "Vote", detail: "Majority vote\nper subject" },
                    ].map((s, i) => (
                      <React.Fragment key={s.step}>
                        <div className="flex-1 text-center p-2 bg-muted/20 border border-border min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">
                            {s.step}
                          </p>
                          <p className="text-[9px] text-muted-foreground whitespace-pre-line leading-tight mt-1">
                            {s.detail}
                          </p>
                        </div>
                        {i < 5 && (
                          <span className="text-muted-foreground text-xs flex-shrink-0">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
 
                  {/* Detailed pipeline explanation */}
                  <ol className="space-y-4 text-xs">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-accent flex items-center justify-center text-xs text-white">
                        1
                      </span>
                      <div>
                        <strong>Raw EEG:</strong> Each subject's recording is
                        stored as a .npy file with shape (19 channels × T
                        timepoints). T is different for everyone because
                        recordings vary from 5 to 21 minutes. We can't
                        stack these into one matrix, so we need to
                        standardize the length.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-accent flex items-center justify-center text-xs text-white">
                        2
                      </span>
                      <div>
                        <strong>Windowing:</strong> We slide a 30-second
                        window across the recording, moving 15 seconds at a
                        time. A 10-minute recording produces about 39
                        overlapping windows. This gives us fixed-size chunks
                        and multiplies our training data. A single subject
                        can produce 30 to 80+ windows depending on their
                        recording length.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-accent flex items-center justify-center text-xs text-white">
                        3
                      </span>
                      <div>
                        <strong>Downsample:</strong> We drop from 500 Hz to
                        128 Hz. A 30-second window at 500 Hz has 15,000
                        samples per channel. At 128 Hz it has 3,840. We
                        lose some fine detail but keep all the frequency
                        bands we care about (up to 45 Hz), and feature
                        extraction runs much faster.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-accent flex items-center justify-center text-xs text-white">
                        4
                      </span>
                      <div>
                        <strong>Feature extraction:</strong> From each
                        window we compute two things: Relative Band Power
                        (how strong each frequency band is) and Spectral
                        Coherence (how synchronized different brain regions
                        are). We take the mean and standard deviation of
                        both across the 30 time steps in each window. That
                        gives us 380 numbers per window. Details below.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-accent flex items-center justify-center text-xs text-white">
                        5
                      </span>
                      <div>
                        <strong>Classification:</strong> An XGBoost model
                        takes those 380 features and predicts AD or CN for
                        each window independently.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-accent flex items-center justify-center text-xs text-white">
                        6
                      </span>
                      <div>
                        <strong>Majority vote:</strong> One subject might
                        have 50 windows. Maybe 35 are classified AD and 15
                        are classified CN. More than half say AD, so the
                        final prediction for that person is AD. This
                        smooths out noisy windows. The output is one
                        prediction and one confidence score per patient.
                      </div>
                    </li>
                  </ol>
                </div>
              </section>
 
              {/* Feature Extraction */}
              <section>
                <div className="bg-white border-2 border-accent p-6">
                  <h3 className="mb-2 text-sm">Feature Extraction</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    We pull two kinds of features from each 30-second window.
                    Together they capture both the intensity of brain activity
                    and how well different brain regions communicate.
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* RBP */}
                    <div>
                      <p className="text-xs font-bold mb-2">
                        Relative Band Power (RBP)
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Brain waves run at different speeds. Slow waves
                        (Delta) dominate during deep sleep. Fast waves
                        (Gamma) show up during active thinking. In
                        Alzheimer's patients, you typically see more
                        slow-wave activity and less Alpha. The brain is
                        slowing down. We measure how much of each frequency
                        band is present relative to the total signal, at
                        every electrode, using Welch's method (a standard
                        power spectrum technique).
                      </p>
                      <div className="grid grid-cols-5 gap-1">
                        {[
                          { sym: "δ", name: "Delta", hz: "0.5-4" },
                          { sym: "θ", name: "Theta", hz: "4-8" },
                          { sym: "α", name: "Alpha", hz: "8-13" },
                          { sym: "β", name: "Beta", hz: "13-25" },
                          { sym: "γ", name: "Gamma", hz: "25-45" },
                        ].map((b) => (
                          <div
                            key={b.name}
                            className="text-center p-2 bg-muted/20 border border-border"
                          >
                            <p className="text-sm font-bold text-primary">
                              {b.sym}
                            </p>
                            <p className="text-[9px] text-muted-foreground">
                              {b.name}
                            </p>
                            <p className="text-[9px] text-muted-foreground">
                              {b.hz} Hz
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* SCC */}
                    <div>
                      <p className="text-xs font-bold mb-2">
                        Spectral Coherence Connectivity (SCC)
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        This measures whether different parts of the brain
                        are talking to each other. We look at every pair of
                        the 19 electrodes and check how similar their
                        signals are at each frequency band, using a wavelet
                        transform (Complex Morlet CWT). Then we average the
                        coherence per electrode. In Alzheimer's, these
                        values tend to drop. The brain regions become less
                        connected.
                      </p>
                      <div className="bg-muted/20 border border-border p-2 font-mono text-[10px]">
                        <p>SCC_x = (1/C) Σ |S_xy| / √(S_xx · S_yy)</p>
                      </div>
                    </div>
                  </div>
 
                  {/* Feature dimensions breakdown */}
                  <div className="bg-muted/20 border border-border p-3 mt-4">
                    <p className="text-xs text-center">
                      For each 30-second window, we take the{" "}
                      <strong>mean</strong> and <strong>std</strong> of both
                      RBP and SCC across time, then flatten:
                    </p>
                    <p className="font-mono text-xs text-center mt-1">
                      mean_RBP(95) + mean_SCC(95) + std_RBP(95) + std_SCC(95)
                      = <strong>380 features per window</strong>
                    </p>
                    <p className="text-[10px] text-muted-foreground text-center mt-1">
                      95 = 5 frequency bands × 19 electrodes
                    </p>
                  </div>
 
                  {/* Feature Breakdown Chart */}
                  <div className="mt-4">
                    <p className="text-xs font-bold mb-2">
                      Feature Breakdown (380 total)
                    </p>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart
                        data={[
                          { name: "RBP mean", value: 95, type: "RBP" },
                          { name: "RBP std", value: 95, type: "RBP" },
                          { name: "SCC mean", value: 95, type: "SCC" },
                          { name: "SCC std", value: 95, type: "SCC" },
                        ]}
                        layout="vertical"
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(151, 124, 98, 0.2)"
                        />
                        <XAxis type="number" stroke="#4A4A4A" fontSize={10} />
                        <YAxis
                          dataKey="name"
                          type="category"
                          stroke="#4A4A4A"
                          fontSize={10}
                          width={70}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "2px solid #957C62",
                            fontSize: "11px",
                          }}
                          formatter={(value: number) =>
                            `${value} features (5 bands × 19 channels)`
                          }
                        />
                        <Bar dataKey="value" fill="#B77466">
                          {[0, 1, 2, 3].map((i) => (
                            <Cell
                              key={i}
                              fill={i < 2 ? "#B77466" : "#957C62"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>
 
              {/* Model Training */}
              <section>
                <div className="bg-white border-2 border-secondary p-6">
                  <h3 className="mb-2 text-sm">
                    <TrendingUp className="w-4 h-4 inline mr-2 text-accent" />
                    Model Training
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    We tried four tree-based models. These work well on tabular
                    data this size. No need for a neural network when you have
                    38 training subjects.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                    {[
                      { name: "XGBoost", detail: "scale_pos_weight" },
                      { name: "CatBoost", detail: "auto class weights" },
                      { name: "Random Forest", detail: "balanced weights" },
                      { name: "LightGBM", detail: "balanced weights" },
                    ].map((m) => (
                      <div
                        key={m.name}
                        className="text-center p-2 bg-muted/20 border border-border"
                      >
                        <p className="font-bold text-foreground text-xs">
                          {m.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {m.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                  <ul className="space-y-2 text-xs">
                    <li>
                      <strong>Split:</strong> We split by subject, not by
                      window. More on this below (it's important).
                      GroupShuffleSplit puts 80% of subjects in train, 20% in
                      test.
                    </li>
                    <li>
                      <strong>Imbalance:</strong> We have almost twice as many
                      AD subjects (25) as CN (13). Without correction, a model
                      could just guess "AD" for everyone and still look decent.
                      All four models use class weighting to penalize this.
                    </li>
                    <li>
                      <strong>Majority vote:</strong> One patient can produce
                      30 to 80+ windows. We classify each window, then take a
                      vote. If most of a patient's windows say AD, the final
                      answer is AD. One prediction per person.
                    </li>
                  </ul>
                </div>
              </section>
 
              {/* Results */}
              <section>
                <div className="bg-white border-2 border-primary p-6">
                  <h3 className="mb-2 text-sm">
                    <BarChart3 className="w-4 h-4 inline mr-2 text-primary" />
                    Hold-Out Results
                  </h3>
                  <div className="space-y-2 text-xs text-muted-foreground mb-4">
                    <p>
                      Tested on 8 held-out subjects that the model never saw
                      during training. Here's what the metrics mean:
                    </p>
                    <ul className="space-y-1 ml-2">
                      <li>
                        <strong>Accuracy</strong> = what fraction of subjects
                        we classified correctly. With 8 subjects, getting one
                        wrong costs 12.5%.
                      </li>
                      <li>
                        <strong>F1</strong> = balances two things: how many of
                        the real AD cases we caught (recall) vs. how many of
                        our AD predictions were actually correct (precision).
                        More useful than accuracy when classes are imbalanced.
                      </li>
                      <li>
                        <strong>AUC</strong> = how well the model separates AD
                        from CN at the window level, before majority voting.
                        1.0 means it ranks every AD window above every CN
                        window. Our models are all above 0.99, meaning the
                        raw window-level separation is very strong.
                      </li>
                    </ul>
                  </div>
 
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={[
                        { model: "XGBoost", Accuracy: 75, F1: 50, AUC: 99.7 },
                        { model: "CatBoost", Accuracy: 62.5, F1: 40, AUC: 99.9 },
                        { model: "RF", Accuracy: 50, F1: 33.3, AUC: 99.9 },
                        { model: "LightGBM", Accuracy: 62.5, F1: 40, AUC: 99.8 },
                      ]}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(151, 124, 98, 0.2)"
                      />
                      <XAxis dataKey="model" stroke="#4A4A4A" fontSize={11} />
                      <YAxis
                        stroke="#4A4A4A"
                        fontSize={10}
                        domain={[0, 100]}
                        tickFormatter={(v: number) => `${v}%`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "2px solid #957C62",
                          fontSize: "11px",
                        }}
                        formatter={(value: number) => `${value}%`}
                      />
                      <Legend />
                      <Bar dataKey="Accuracy" fill="#B77466" />
                      <Bar dataKey="F1" fill="#E2B59A" />
                      <Bar dataKey="AUC" fill="#957C62" />
                    </BarChart>
                  </ResponsiveContainer>
 
                  <table className="w-full text-xs border-collapse mt-4">
                    <thead>
                      <tr className="bg-muted/30">
                        <th className="text-left p-2 border border-border">Model</th>
                        <th className="text-left p-2 border border-border">Accuracy</th>
                        <th className="text-left p-2 border border-border">F1</th>
                        <th className="text-left p-2 border border-border">AUC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { m: "XGBoost", a: "0.750", f: "0.500", auc: "0.9972" },
                        { m: "CatBoost", a: "0.625", f: "0.400", auc: "0.9992" },
                        { m: "Random Forest", a: "0.500", f: "0.333", auc: "0.9994" },
                        { m: "LightGBM", a: "0.625", f: "0.400", auc: "0.9983" },
                      ].map((r) => (
                        <tr
                          key={r.m}
                          className={
                            r.m === "XGBoost" ? "bg-primary/10 font-bold" : ""
                          }
                        >
                          <td className="p-2 border border-border">{r.m}</td>
                          <td className="p-2 border border-border">{r.a}</td>
                          <td className="p-2 border border-border">{r.f}</td>
                          <td className="p-2 border border-border">{r.auc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Why is AUC near-perfect but accuracy only 75%? AUC
                    measures window-level separation before voting. At that
                    level, AD and CN windows are clearly different. But after
                    majority voting on only 8 subjects, a single wrong person
                    drops accuracy by 12.5%. XGBoost got 6 out of 8 right.
                    We picked it as our primary model.
                  </p>
 
                  {/* Confusion Matrix */}
                  <div className="mt-6">
                    <p className="text-xs font-bold mb-2">
                      XGBoost Confusion Matrix (8 subjects)
                    </p>
                    <div className="flex justify-center">
                      <div className="inline-block">
                        <div className="grid grid-cols-3 text-xs text-center">
                          <div className="p-2"></div>
                          <div className="p-2 font-bold text-muted-foreground">
                            Predicted AD
                          </div>
                          <div className="p-2 font-bold text-muted-foreground">
                            Predicted CN
                          </div>
                          <div className="p-2 font-bold text-muted-foreground text-right">
                            Actual AD
                          </div>
                          <div className="p-3 bg-primary/20 border border-border font-bold">
                            TP
                          </div>
                          <div className="p-3 bg-destructive/10 border border-border">
                            FN
                          </div>
                          <div className="p-2 font-bold text-muted-foreground text-right">
                            Actual CN
                          </div>
                          <div className="p-3 bg-destructive/10 border border-border">
                            FP
                          </div>
                          <div className="p-3 bg-primary/20 border border-border font-bold">
                            TN
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2 text-center">
                          6 correct (green), 2 misclassified (red). 75%
                          subject-level accuracy.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
 
              {/* Key Design Decisions */}
              <section>
                <div className="bg-white border-2 border-accent p-6">
                  <h3 className="mb-4 text-sm">
                    <Settings className="w-4 h-4 inline mr-2 text-accent" />
                    Key Design Decisions
                  </h3>
                  <div className="space-y-5 text-xs">
                    {/* Data leakage */}
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-primary mt-1 flex-shrink-0" />
                      <div className="space-y-2">
                        <p>
                          <strong>Fixing data leakage (the biggest one):</strong>
                        </p>
                        <p>
                          Every person in the dataset gives us many windows.
                          Subject 18 alone might produce 50 windows because of
                          the sliding window approach.
                        </p>
                        <p>
                          The original code used{" "}
                          <code className="bg-muted/30 px-1">
                            train_test_split
                          </code>
                          , which randomly shuffles all windows and splits them.
                          So some of subject 18's windows end up in training and
                          some end up in validation. When the model tries to
                          predict subject 18 in validation, it already saw that
                          person's brain patterns during training. It gets it
                          right, but that's not detecting Alzheimer's. That's
                          recognizing a person it already saw. That's why the
                          early code showed 98% accuracy.
                        </p>
                        <p>
                          The fix:{" "}
                          <code className="bg-muted/30 px-1">
                            GroupShuffleSplit
                          </code>
                          . We pass it a groups array that says "these 50
                          windows all belong to subject 18, these 40 belong to
                          subject 3" and so on. It makes sure each subject is
                          entirely in training or entirely in validation. Never
                          both. So when we evaluate, we're testing on people the
                          model has genuinely never seen before.
                        </p>
                        <p>
                          That's why accuracy dropped from 98% to 75%. The model
                          is now being tested on strangers. 75% is real. 98% was
                          not.
                        </p>
                      </div>
                    </div>
 
                    {/* Wavelet coherence */}
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-secondary mt-1 flex-shrink-0" />
                      <div className="space-y-2">
                        <p>
                          <strong>Wavelet coherence instead of simple correlation:</strong>
                        </p>
                        <p>
                          We could have just checked whether electrode signals
                          look similar overall. But Alzheimer's disrupts brain
                          connectivity differently at different frequencies. The
                          Complex Morlet CWT lets us measure coherence at each
                          frequency band separately. That's more information for
                          the model to work with, and it matches what the
                          neuroscience literature says about how AD affects the
                          brain.
                        </p>
                      </div>
                    </div>
 
                    {/* Majority voting */}
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-accent mt-1 flex-shrink-0" />
                      <div className="space-y-2">
                        <p>
                          <strong>Majority voting over windows:</strong>
                        </p>
                        <p>
                          A single 30-second window can be noisy. Maybe the
                          patient moved, or there was an artifact. If we based
                          the whole diagnosis on one window, one bad segment
                          could flip the result. By voting across all 30-80
                          windows, the overall pattern wins out. It also gives
                          us a natural confidence score: if 90% of windows say
                          AD, we're more confident than if it's 55%.
                        </p>
                      </div>
                    </div>
 
                    {/* Modular code */}
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-destructive mt-1 flex-shrink-0" />
                      <div className="space-y-2">
                        <p>
                          <strong>Modular, reproducible code:</strong>
                        </p>
                        <p>
                          preprocess.py handles feature extraction.
                          model_training.py handles training and evaluation.
                          predict.py runs inference on new data. They all share
                          utils.py for common functions (loading data, flattening
                          features, majority voting). When the test set was
                          released Sunday morning, we ran predict.py on it with
                          one command.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
 
              {/* Disclaimer */}
              <section>
                <div className="bg-white border-2 border-destructive p-4">
                  <p className="text-xs text-muted-foreground">
                    <Info className="w-3 h-3 inline mr-1 text-destructive" />
                    <strong>Naana is a screening tool, not a diagnosis.</strong>{" "}
                    Always consult a healthcare provider.
                  </p>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
 
      {/* Footer */}
      <footer className="bg-primary border-t-4 border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-white"> Naana © 2026</p>
        </div>
      </footer>
    </div>
  );
}