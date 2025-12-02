import { FC } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Header from "../../components/Header/Header";
import "./HomePage.css";

export const HomePage: FC = () => {
  return (
    <>
      <Header />
      
      <div className="video-background">
        <div className="video-wrapper">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            disablePictureInPicture
            controls={false}
            className="background-video"
            preload="metadata"
            disableRemotePlayback
            crossOrigin="anonymous"
          >
            <source 
              src="/static/videos/construction-background.MP4" 
              type="video/mp4" 
            />
            Ваш браузер не поддерживает видео.
          </video>
        </div>
        
        <Container className="home-container">
          <Row>
            <Col md={8} className="mx-auto text-center">
              <h1 className="home-title">Калькулятор котлованов</h1>
              <p className="home-description">
                Добро пожаловать в систему расчета котлованов! Здесь вы можете 
                выбрать материалы для расчета и управлять вашими проектами.
              </p>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};