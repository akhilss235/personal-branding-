// /app/component/Home/Home_template.jsx
"use client";
export default function Home_template() {
  return (
    <div className="heroGrid">
      
      {/* Left Side — Headline */}
      <div className="headline reveal">
        <div className="kicker">
          <span className="pill"><span className="spark"></span> Creative Systems Architect</span>
          <span className="pill"><span className="spark" style={{ background:"rgba(201,162,77,.9)" }}></span> Diver Guide</span>
        </div>

        <h2 className="title">Crafting systems with depth,<br/>sound, and structure.</h2>
        <p className="subtitle">Designing interfaces, soundscapes & immersive digital experiences shaped like water — fluid, structured and deeply intentional.</p>

        <div className="heroActions">
          <button className="btn primary">Explore Work</button>
          <button className="btn">Contact</button>
        </div>

        <div className="note">
          <span className="i">i</span>
          <span>Scroll down to dive deeper — each layer reveals a new depth.</span>
        </div>
      </div>

      {/* Right Side — Cards */}
       <div className="sideCards reveal">
        <div className="card">
          <div className="row">
            <h3>Sound Engineering</h3>
            <div className="signal"></div>
          </div>
          <p>Immersive audio design for underwater and calm atmospheric worlds.</p>
        </div>

        <div className="card">
          <div className="row">
            <h3>Creative Tech</h3>
            <div className="signal"></div>
          </div>
          <p>Systems built with code, visuals, interaction and flow.</p>
        </div>

        <div className="card">
          <div className="row">
            <h3>Diver-Guide Philosophy</h3>
            <div className="signal"></div>
          </div>
          <p>Slow, deep, structured — translated into design thinking.</p>
        </div>
      </div> 
    </div>
  );
}
