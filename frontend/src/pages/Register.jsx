import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

function AvatarPreview() {
  const ref = useRef(null);

  useEffect(() => {
    if (!window.customElements || !window.customElements.get('model-viewer')) {
      const s = document.createElement('script');
      s.type = 'module';
      s.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
      document.head.appendChild(s);
      return () => { document.head.removeChild(s); };
    }
    return undefined;
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      el.setAttribute('camera-controls', '');
      el.setAttribute('auto-rotate', '');
      el.setAttribute('exposure', '1');
    }
  }, []);

  return (
    <>
      <model-viewer
        ref={ref}
        src="https://modelviewer.dev/shared-assets/models/Astronaut.glb"
        alt="3D Avatar"
        style={{ width: 280, height: 280 }}
      />
      <div className="mt-3 text-sm text-gray-400">3D Avatar Preview</div>
    </>
  );
}

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#00d85a" }}>
      <div className="w-[920px] max-w-full h-[560px] rounded-3xl shadow-2xl overflow-hidden flex" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}>
        {/* Left: Avatar preview container */}
        <div className="w-1/2 bg-white/80 flex items-center justify-center p-8">
          <div className="w-full h-full rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300">
            {/* 3D avatar preview using model-viewer */}
            <div className="text-center">
              {/* model-viewer is a web component; we load its script dynamically */}
              <AvatarPreview />
            </div>
          </div>
        </div>

        {/* Right: Registration multi-step card (static first step) */}
        <div className="w-1/2 bg-white p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Register Now</h2>
          <p className="text-sm text-gray-500 mb-6">Create your account — step 1 of 3</p>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">First Name</label>
                <input aria-label="First Name" placeholder="Jane" className="w-full rounded-md border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Last Name</label>
                <input aria-label="Last Name" placeholder="Wanjiru" className="w-full rounded-md border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-600" />
              </div>
            </div>

            <div>
              <button className="w-full bg-[#0b4d3c] hover:bg-[#0f6b53] text-white font-semibold py-3 rounded-md tracking-wider">NEXT</button>
            </div>
          </form>

          <p className="mt-6 text-sm text-gray-500">
            Already have an account? <Link to="/login" className="text-green-700 font-medium">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
