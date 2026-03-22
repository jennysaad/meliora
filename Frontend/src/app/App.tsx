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

type ModelType = "CatBoost" | "XGBoost" | "LightGBM" | "Random Forest" | null;
type TabType = "home" | "about";

interface PredictionResult {
  prediction: string;
  confidence: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [selectedModel, setSelectedModel] = useState<ModelType>("CatBoost");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [uploadedData, setUploadedData] = useState<any[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      // Mock data preview
      setUploadedData([
        { id: 1, age: 65, mmse: 24, memory_score: 3.2, education: 16 },
        { id: 2, age: 72, mmse: 21, memory_score: 2.8, education: 12 },
        { id: 3, age: 68, mmse: 26, memory_score: 3.5, education: 18 },
        { id: 4, age: 70, mmse: 22, memory_score: 2.9, education: 14 },
        { id: 5, age: 75, mmse: 19, memory_score: 2.3, education: 10 },
      ]);
    }
  };

  const handlePredict = () => {
    if (!uploadedFile || !selectedModel) return;

    // Mock prediction
    setTimeout(() => {
      const mockConfidence = Math.random() * 40 + 60;
      setPrediction({
        prediction: mockConfidence > 75 ? "Low Risk" : "Moderate Risk",
        confidence: mockConfidence,
      });
      setShowResults(true);
    }, 1000);
  };

  // Mock data for charts
  const accuracyData = [
    { model: "CatBoost", accuracy: 98 },
    { model: "XGBoost", accuracy: 87 },
    { model: "LightGBM", accuracy: 97 },
    { model: "Random Forest", accuracy: 98 },
  ];

  const performanceData = [
    { metric: "Accuracy", value: 98 },
    { metric: "Precision", value: 88 },
    { metric: "Recall", value: 85 },
    { metric: "F1-Score", value: 86 },
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
            <div className="flex-1 text-center">
              <h1 className="text-xl text-white">Naana</h1>
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
                    {uploadedFile ? uploadedFile.name : "Upload Your Data"}
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".csv,.json,.txt"
                  />

                  <select
                    value={selectedModel || ""}
                    onChange={(e) =>
                      setSelectedModel(e.target.value as ModelType)
                    }
                    className="px-4 py-3 bg-white border-2 border-accent text-xs text-foreground cursor-pointer"
                  >
                    <option value="CatBoost">CatBoost</option>
                    <option value="XGBoost">XGBoost</option>
                    <option value="LightGBM">LightGBM</option>
                    <option value="Random Forest">Random Forest</option>
                  </select>
                </div>

                {uploadedFile && (
                  <button
                    onClick={handlePredict}
                    className="px-8 py-2 bg-accent text-white border-2 border-accent hover:bg-accent/80 text-sm mb-6"
                  >
                    Analyze Data ✨
                  </button>
                )}

                {/* Data Preview */}
                {uploadedData.length > 0 && (
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
                )}
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
                  {showResults && prediction ? (
                    <div className="w-full text-center">
                      <h3 className="mb-6 text-lg">Results</h3>
                      <div className="flex flex-col items-center gap-6">
                        <GrandparentIcon
                          variant={
                            prediction.confidence > 70 ? "happy" : "neutral"
                          }
                          className="w-28 h-28"
                        />
                        <div className="max-w-md w-full">
                          <div className="bg-muted/30 border-2 border-secondary p-6">
                            <p className="text-xs text-muted-foreground mb-2">
                              Prediction Result
                            </p>
                            <p className="text-2xl mb-4">
                              {prediction.prediction}
                            </p>
                            <p className="text-xs text-muted-foreground mb-2">
                              Confidence
                            </p>
                            <div className="bg-white border-2 border-primary h-6 overflow-hidden">
                              <div
                                style={{ width: `${prediction.confidence}%` }}
                                className="h-full bg-primary"
                              />
                            </div>
                            <p className="text-sm mt-2">
                              {prediction.confidence.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
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
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={performanceData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(151, 124, 98, 0.2)"
                        />
                        <XAxis
                          dataKey="metric"
                          stroke="#4A4A4A"
                          fontSize={10}
                        />
                        <YAxis stroke="#4A4A4A" fontSize={10} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "2px solid #957C62",
                            fontSize: "11px",
                          }}
                        />
                        <Bar dataKey="value" fill="#B77466" />
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
