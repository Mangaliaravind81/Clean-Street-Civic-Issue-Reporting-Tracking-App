

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import hero from "../assets/hero.jpg";
import garbage from "../assets/garbage.jpg";
import pothole from "../assets/pothole.jpg";
import streetlight from "../assets/streetlight.jpg";
import water from "../assets/water.jpg";

import report from "../assets/report.png";
import track from "../assets/track.png";
import community from "../assets/community.png";

import { NavLink } from "react-router-dom";

function Home() {
  return (
    <>
      <Navbar />

      {/* HERO */}
      <section
        id="home"
        className="relative h-screen bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${hero})` }}
      >
        {/* White Overlay */}
        <div className="absolute inset-0 bg-white/70"></div>

        <div className="relative z-10 text-center text-black px-4">
          <h1 className="text-5xl font-bold">
            Make Your City <span className="text-green-500">Clean & Green</span>
          </h1>

          <p className="mt-4 max-w-xl mx-auto">
            Report civic issues, track resolutions, and build a better
            community.
          </p>

          <div className="mt-6 flex justify-center gap-4">
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg">
              Report Issue
            </button>

            <button className="bg-white border text-green-700 px-6 py-3 rounded-lg">
              View Reports
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 bg-gray-50">
        <h2 className="text-4xl font-bold text-center">What We Track</h2>

        <div className="grid md:grid-cols-4 gap-8 mt-12 px-10">
          {[
            { name: "Garbage", img: garbage },
            { name: "Potholes", img: pothole },
            { name: "Street Lights", img: streetlight },
            { name: "Water Issues", img: water },
          ].map((item) => (
            <div
              key={item.name}
              className="bg-white p-6 rounded-xl shadow text-center"
            >
              <img
                src={item.img}
                alt={item.name}
                className="h-20 mx-auto mb-4"
              />
              <h3 className="font-semibold text-lg">{item.name}</h3>
              <p className="text-gray-500 mt-2">
                Easily report and track updates.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-20">
        <h2 className="text-4xl font-bold text-center">How It Works</h2>

        <div className="grid md:grid-cols-3 gap-10 mt-12 px-10 text-center">
          <div>
            <img src={report} className="h-32 mx-auto mb-4" />
            <h3 className="font-semibold text-xl">1. Report Issue</h3>
            <p className="text-gray-500">Upload photo and location.</p>
          </div>

          <div>
            <img src={track} className="h-32 mx-auto mb-4" />
            <h3 className="font-semibold text-xl">2. Track Status</h3>
            <p className="text-gray-500">See live progress.</p>
          </div>

          <div>
            <img src={community} className="h-32 mx-auto mb-4" />
            <h3 className="font-semibold text-xl">3. Community Impact</h3>
            <p className="text-gray-500">Together we fix issues.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-700 py-20 text-center text-white">
        <h2 className="text-4xl font-bold">Join the Clean City Movement</h2>

        <p className="mt-4">Together we can build better communities.</p>

        <NavLink
          to="/register"
          className="inline-block mt-6 bg-white text-green-700 px-6 py-3 rounded-lg"
        >
          Start Now →
        </NavLink>
      </section>

      <Footer />
    </>
  );
}

export default Home;
