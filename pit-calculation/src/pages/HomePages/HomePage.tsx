import { FC } from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav, Container, Row, Col } from "react-bootstrap";
import Header from "../../components/Header/Header";
import "./HomePage.css";

export const HomePage: FC = () => {
  return (
    <>
      <Header />
      <Navbar bg="light" expand="lg" className="home-navbar">
        <Container>
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/materials" className="nav-link-custom">
              Материалы
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>
      
      <div className="video-background">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          disablePictureInPicture
          controls={false}
          className="background-video">
          <source 
            src="/static/videos/construction-background.MP4" 
            type="video/mp4" 
          />
        </video>
        
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