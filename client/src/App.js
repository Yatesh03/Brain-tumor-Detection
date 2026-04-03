
import { ThemeProvider } from "styled-components";
import { useState, useEffect } from "react";
import { darkTheme } from "./utils/themes";
import styled from "styled-components";
import ImageUpload from "./Components/ImageUpload";
import ImagesCard from "./Components/ImagesCard";
import Loader from "./Components/Loader/Loader";
import ResultCard from "./Components/ResultCard";
import axios from "axios";
import { Images } from "./data";

const Body = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(180deg, #111524 0%, ${({ theme }) => theme.bg} 40%);
  padding: 20px 16px 48px 16px;
  box-sizing: border-box;
`;

const Heading = styled.div`
  font-size: 46px;
  @media (max-width: 530px) {
    font-size: 34px;
  }
  font-weight: 700;
  letter-spacing: 0.3px;
  color: ${({ theme }) => theme.text};
  margin: 8px 0 24px 0;
`;

const Container = styled.div`
  width: 100%;
  max-width: 1160px;
  display: flex;
  justify-content: center;
  flex-direction: row;
  @media (max-width: 1100px) {
    flex-direction: column;
    align-items: center;
  }
  gap: 24px;
`;

const Centered = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 70vh;
`;

const FlexItem = styled.div`
  width: 100%;
  max-width: 560px;
  @media (max-width: 530px) {
    max-width: 100%;
  }
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
  background: ${({ theme }) => theme.card};
  border: 1px solid #ffffff14;
  border-radius: 14px;
  padding: 18px;
  box-sizing: border-box;
  box-shadow: 0 10px 24px #00000033;
`;

const TextCenter = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  text-align: center;
`;


const SelectedImages = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  @media (max-width: 530px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  gap: 12px;
  align-items: center;
`;


const Button = styled.button`
  min-height: 48px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(90deg, #7f46e6 0%, #9c5cf0 100%);
  color: white;
  margin: 0;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 14px;
  cursor: pointer;
  transition: transform 0.15s ease, filter 0.15s ease;
  &:hover {
    filter: brightness(1.05);
    transform: translateY(-1px);
  }
`;

const Typo = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
`;

const ResultWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TopBar = styled.div`
  width: 100%;
  max-width: 1160px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.textSoft};
`;

const AuthCard = styled.div`
  width: 460px;
  max-width: calc(100vw - 32px);
  background: ${({ theme }) => theme.card};
  border: 1px solid #ffffff16;
  border-radius: 14px;
  padding: 26px;
  box-shadow: 0 12px 32px #00000045;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AuthHeading = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
`;

const AuthSubtext = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.textSoft};
`;

const Input = styled.input`
  min-height: 42px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.soft2};
  outline: none;
  padding: 0 12px;
  background: transparent;
  color: ${({ theme }) => theme.text};
`;

const ErrorText = styled.div`
  color: #ff6b6b;
  font-size: 14px;
`;

const SuccessText = styled.div`
  color: #58d68d;
  font-size: 14px;
`;



function App() {
  const API_BASE_URL = "http://127.0.0.1:5000";
  const [images, setImages] = useState(null);
  const [predictedImage, setPredictedImage] = useState(null);
  const [predictions, setPredictions] = useState();
  const [loading, setLoading] = useState(false);
  const [showPrediction, setShowPrediction] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [backendReady, setBackendReady] = useState(false);

  const generatePrediction = async () => {
    if (!images?.length) return;
    setLoading(true);
    const imageData = images.map((img) => img.base64_file);
    const data = { image: imageData };

    try {
      const res = await axios.post(`${API_BASE_URL}/`, data);
      setPredictedImage(images);
      setPredictions({
        image: imageData,
        result: res.data.result || [],
        boxes: res.data.boxes || [],
      });
      setShowPrediction(true);
    } catch (err) {
      console.error("Prediction request failed", err);
      setShowPrediction(false);
    } finally {
      setLoading(false);
    }
  };

  const generateNewImages = () => {
    const newImages = [];
    //get 6 random images from the data
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * Images.length);
      newImages.push({
        base64_file: Images[randomIndex],
        file_name: `Sample ${i + 1}`,
      });
    }
    setImages(newImages);
  };

  useEffect(() => {
    generateNewImages();
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("authUser");
    if (storedToken && storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (err) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
      }
    }
  }, []);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        await axios.get(`${API_BASE_URL}/home`);
        setBackendReady(true);
      } catch (err) {
        setBackendReady(false);
      }
    };
    checkBackend();
  }, [API_BASE_URL]);

  const resetAuthState = () => {
    setAuthError("");
    setAuthSuccess("");
  };

  const handleAuthSubmit = async () => {
    resetAuthState();
    if (!email || !password || (isSignUp && !fullName)) {
      setAuthError("Please fill all required fields");
      return;
    }

    setAuthLoading(true);
    try {
      const endpoint = isSignUp ? "/auth/signup" : "/auth/signin";
      const payload = isSignUp ? { fullName, email, password } : { email, password };
      const res = await axios.post(`${API_BASE_URL}${endpoint}`, payload);
      localStorage.setItem("authToken", res.data.token);
      localStorage.setItem("authUser", JSON.stringify(res.data.user));
      setCurrentUser(res.data.user);
      setAuthSuccess(isSignUp ? "Account created successfully" : "Signed in successfully");
      setFullName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      if (err?.code === "ERR_NETWORK") {
        setAuthError("Backend is not reachable. Start `python app.py` first.");
      } else {
        setAuthError(err?.response?.data?.error || "Authentication failed");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setShowPrediction(false);
    setPredictions(undefined);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Body>
        <Heading>Brain Tumor Detector 🧠</Heading>
        {!currentUser && (
          <Centered>
            <AuthCard>
              <AuthHeading>{isSignUp ? "Create account" : "Sign in"}</AuthHeading>
              <AuthSubtext>
                {isSignUp
                  ? "Sign up to store your profile and use predictions."
                  : "Sign in to continue to the prediction dashboard."}
              </AuthSubtext>
              {isSignUp && (
                <Input
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              )}
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {authError && <ErrorText>{authError}</ErrorText>}
              {!backendReady && (
                <ErrorText>
                  Backend offline. Run <code>python app.py</code> in project root.
                </ErrorText>
              )}
              {authSuccess && <SuccessText>{authSuccess}</SuccessText>}
              <Button onClick={handleAuthSubmit}>
                {authLoading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
              </Button>
              <TextCenter
                style={{ fontSize: "14px", cursor: "pointer" }}
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  resetAuthState();
                }}
              >
                {isSignUp ? "Already have an account? Sign In" : "New user? Create account"}
              </TextCenter>
            </AuthCard>
          </Centered>
        )}
        {currentUser && (
          <TopBar>
            <div>{currentUser.fullName} ({currentUser.email})</div>
            <Button style={{ margin: 0, minHeight: "36px" }} onClick={handleSignOut}>
              Sign Out
            </Button>
          </TopBar>
        )}
        {currentUser && (loading ?
          <Centered>
            <Loader />
          </Centered>
          :
          <Container>
            <FlexItem>
              <ImageUpload setImages={setImages} />
              <TextCenter>Or try with sample data</TextCenter>
              <SelectedImages>
                {images && images.map((image, index) => {
                  return (
                    <ImagesCard
                      key={index}
                      image={image}
                    />
                  );
                })}
              </SelectedImages>
              <Button onClick={() => generateNewImages()}>Get Sample Images</Button>
              {images &&
                <Button onClick={() => { generatePrediction() }}>PREDICT</Button>}
            </FlexItem>
            {showPrediction &&
              <FlexItem style={{ gap: '22px' }}>
                <Typo>Our Predictions</Typo>
                <ResultWrapper>
                  {predictedImage.map((image, index) => {
                    return (
                      <ResultCard
                        key={index}
                        image={image}
                        prediction={predictions.result[index]}
                        box={predictions.boxes?.[index]}
                      />
                    );
                  })}
                </ResultWrapper>
              </FlexItem>
            }
          </Container>
        )}
      </Body>
    </ThemeProvider>
  );
}

export default App;
