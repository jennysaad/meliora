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
              {/* GrandpaCane icon at the top of about page */}
              <div className="flex justify-center mb-2">
                <ImageWithFallback
                  src={"/src/app/components/GrandpaCaneTransparent.png"}
                  alt="Grandpa Cane"
                  className="w-28 h-auto drop-shadow-lg"
                />
              </div>
              {/* How It Works Section */}
              <section>
                <div className="bg-white border-2 border-primary p-6">
                  <div className="flex flex-col md:flex-row items-start justify-between gap-8">
                    <div className="flex-1">
                      <h2 className="mb-6 flex items-center gap-2 text-lg">
                        <Brain className="w-5 h-5 text-primary" />
                        How It Works
                      </h2>
                      <div className="space-y-4 text-sm">
                        <p>
                          Naana uses advanced machine learning models to analyze
                          patterns in medical data that may indicate early signs
                          of Alzheimer's disease.
                        </p>
                        <p>
                          Our models have been trained on extensive datasets and
                          validated by medical professionals to provide
                          accurate, helpful insights.
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0"></div>
                  </div>
                </div>
              </section>

              {/* AI Models */}
              <section>
                <div className="bg-white border-2 border-secondary p-6">
                  <h3 className="mb-4 text-sm">Our AI Models</h3>
                  <ul className="space-y-3 text-xs">
                    <li className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-primary mt-1" />
                      <div>
                        <strong>CatBoost:</strong> Excellent for handling
                        categorical features with high accuracy
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-secondary mt-1" />
                      <div>
                        <strong>XGBoost:</strong> Fast and efficient gradient
                        boosting framework
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-accent mt-1" />
                      <div>
                        <strong>LightGBM:</strong> Optimized for speed and
                        memory efficiency
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-destructive mt-1" />
                      <div>
                        <strong>Random Forest:</strong> Robust ensemble method
                        for reliable predictions
                      </div>
                    </li>
                  </ul>
                </div>
              </section>

              {/* The Process */}
              <section>
                <div className="bg-white border-2 border-accent p-6">
                  <h3 className="mb-4 text-sm">The Process</h3>
                  <ol className="space-y-3 text-xs">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-accent border-2 border-accent flex items-center justify-center text-xs text-white">
                        1
                      </span>
                      <div>
                        <strong>Upload Your Data:</strong> Securely upload your
                        medical data in CSV, JSON, or TXT format
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-accent border-2 border-accent flex items-center justify-center text-xs text-white">
                        2
                      </span>
                      <div>
                        <strong>Select a Model:</strong> Choose the AI model
                        that best fits your needs
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-accent border-2 border-accent flex items-center justify-center text-xs text-white">
                        3
                      </span>
                      <div>
                        <strong>Get Results:</strong> Receive a prediction with
                        confidence score and insights
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-accent border-2 border-accent flex items-center justify-center text-xs text-white">
                        4
                      </span>
                      <div>
                        <strong>Take Action:</strong> Use the results to inform
                        conversations with healthcare providers
                      </div>
                    </li>
                  </ol>
                </div>
              </section>

              {/* Important Notice */}
              <section>
                <div className="bg-white border-2 border-destructive p-6">
                  <h3 className="mb-3 flex items-center gap-2 text-sm">
                    <Info className="w-4 h-4 text-destructive" />
                    Important Notice
                  </h3>
                  <p className="text-xs">
                    <strong>
                      This tool is designed to support, not replace,
                      professional medical advice.
                    </strong>
                    Always consult with qualified healthcare providers for
                    proper diagnosis, treatment, and care. The predictions
                    provided are based on machine learning models and should be
                    used as supplementary information only.
                  </p>
                </div>
              </section>

              {/* Community Support */}
              <section>
                <div className="bg-white border-2 border-secondary p-6 text-center">
                  <h3 className="mb-3 text-sm">You're Not Alone</h3>
                  <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
                    Millions of families are navigating this journey together.
                    Remember to be kind to yourself, reach out for support, and
                    celebrate the small moments of connection and joy.
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
