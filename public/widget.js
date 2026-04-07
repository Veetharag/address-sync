(function() {
  function init() {
    const script = document.querySelector('script[data-merchant-token]');
    if (!script) return;
    const token = script.getAttribute('data-merchant-token');
    if (!token) return;
    const btn = document.getElementById('addresssync-btn');
    if (!btn) return;

    const styles = `
      #as-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 99999; display: flex; align-items: center; justify-content: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      #as-modal { background: white; border-radius: 12px; padding: 24px; width: 100%; max-width: 360px; margin: 16px; box-sizing: border-box; }
      .as-logo { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
      .as-logo-icon { width: 28px; height: 28px; background: #000; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      .as-tagline { font-size: 12px; color: #666; background: #f5f5f5; border-radius: 6px; padding: 6px 10px; margin-bottom: 16px; border-left: 2px solid #000; }
      .as-close { margin-left: auto; background: none; border: none; font-size: 20px; cursor: pointer; color: #999; padding: 0; line-height: 1; }
      .as-google-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; border: 1px solid #ddd; border-radius: 8px; padding: 10px; font-size: 14px; font-weight: 500; cursor: pointer; background: white; color: #333; margin-bottom: 10px; box-sizing: border-box; }
      .as-google-btn:hover { background: #f5f5f5; }
      .as-divider { display: flex; align-items: center; gap: 8px; margin: 12px 0; }
      .as-divider-line { flex: 1; height: 1px; background: #eee; }
      .as-divider-text { font-size: 12px; color: #999; }
      .as-field { margin-bottom: 10px; }
      .as-field label { display: block; font-size: 12px; color: #666; margin-bottom: 3px; }
      .as-field input { width: 100%; box-sizing: border-box; border: 1px solid #ddd; border-radius: 6px; padding: 8px 10px; font-size: 13px; }
      .as-row { display: flex; gap: 8px; }
      .as-submit { width: 100%; background: #000; color: white; border: none; border-radius: 8px; padding: 10px; font-size: 14px; font-weight: 500; cursor: pointer; margin-top: 4px; box-sizing: border-box; }
      .as-submit:hover { background: #222; }
      .as-powered { font-size: 11px; color: #999; text-align: center; margin-top: 10px; }
      .as-powered a { color: #999; }
      .as-switch { font-size: 12px; color: #666; text-align: center; margin-top: 12px; }
      .as-switch a { color: #000; font-weight: 500; cursor: pointer; text-decoration: underline; }
      .as-success { text-align: center; padding: 16px 0; }
      .as-success-icon { width: 44px; height: 44px; background: #e8f5e9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; font-size: 20px; }
      .as-choice-btn { width: 100%; border: 1px solid #ddd; border-radius: 8px; padding: 14px; font-size: 14px; cursor: pointer; background: white; color: #333; margin-bottom: 10px; text-align: left; box-sizing: border-box; }
      .as-choice-btn:hover { background: #f5f5f5; border-color: #000; }
      .as-choice-title { font-weight: 500; font-size: 14px; margin-bottom: 2px; }
      .as-choice-desc { font-size: 12px; color: #999; }
      .as-back { background: none; border: none; font-size: 12px; color: #999; cursor: pointer; padding: 0; margin-bottom: 12px; }
      .as-back:hover { color: #333; }
      .as-error { font-size: 12px; color: #e53e3e; margin-top: 6px; }
    `;

    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);

    btn.addEventListener('click', function() {
      const overlay = document.createElement('div');
      overlay.id = 'as-overlay';

      overlay.innerHTML = `
        <div id="as-modal">
          <div class="as-logo">
            <div class="as-logo-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" stroke-width="1.5">
                <path d="M8 2C5.2 2 3 4.2 3 7c0 3.5 5 8 5 8s5-4.5 5-8c0-2.8-2.2-5-5-5z"/>
                <circle cx="8" cy="7" r="1.5"/>
              </svg>
            </div>
            <span style="font-size:15px;font-weight:500;">AddressSync</span>
            <button class="as-close" id="as-close-btn">×</button>
          </div>
          <div class="as-tagline">Tired of updating your address on every website? Register once. Ship everywhere.</div>

          <!-- Step 0: Choose login or signup -->
          <div id="as-step-choose">
            <p style="font-size:14px;font-weight:500;margin:0 0 12px;">How would you like to continue?</p>
            <button class="as-choice-btn" id="as-choose-login">
              <div class="as-choice-title">I already have an account</div>
              <div class="as-choice-desc">Sign in and auto-fill your saved address</div>
            </button>
            <button class="as-choice-btn" id="as-choose-signup">
              <div class="as-choice-title">I'm new to AddressSync</div>
              <div class="as-choice-desc">Save my address and create an account</div>
            </button>
          </div>

          <!-- Step 1: Login -->
          <div id="as-step-login" style="display:none;">
            <button class="as-back" id="as-back-from-login">← Back</button>
            <p style="font-size:14px;font-weight:500;margin:0 0 12px;">Sign in to your account</p>
            <button class="as-google-btn" id="as-google-login-btn">
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.31z"/>
              </svg>
              Continue with Google
            </button>
            <div class="as-divider"><div class="as-divider-line"></div><span class="as-divider-text">or</span><div class="as-divider-line"></div></div>
            <div class="as-field"><label>Email</label><input type="email" id="as-login-email" placeholder="jane@example.com" /></div>
            <div class="as-field"><label>Password</label><input type="password" id="as-login-password" placeholder="••••••••" /></div>
            <div class="as-error" id="as-login-error" style="display:none;"></div>
            <button class="as-submit" id="as-login-btn">Sign in & fetch my address</button>
            <p class="as-powered">Powered by <a href="https://address-sync.vercel.app" target="_blank">AddressSync</a></p>
          </div>

          <!-- Step 2: Signup -->
          <div id="as-step-signup" style="display:none;">
            <button class="as-back" id="as-back-from-signup">← Back</button>
            <p style="font-size:14px;font-weight:500;margin:0 0 12px;">Create your account</p>
            <button class="as-google-btn" id="as-google-signup-btn">
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.31z"/>
              </svg>
              Sign up with Google
            </button>
            <div class="as-divider"><div class="as-divider-line"></div><span class="as-divider-text">or fill in manually</span><div class="as-divider-line"></div></div>
            <div class="as-field"><label>Full name</label><input type="text" id="as-name" placeholder="Jane Smith" /></div>
            <div class="as-field"><label>Email</label><input type="email" id="as-email" placeholder="jane@example.com" /></div>
            <div class="as-field"><label>Password</label><input type="password" id="as-password" placeholder="Create a password" /></div>
            <div class="as-field"><label>Street address</label><input type="text" id="as-street" placeholder="123 Main St" /></div>
            <div class="as-row">
              <div class="as-field" style="flex:1"><label>City</label><input type="text" id="as-city" placeholder="San Jose" /></div>
              <div class="as-field" style="width:60px"><label>State</label><input type="text" id="as-state" placeholder="CA" /></div>
              <div class="as-field" style="width:80px"><label>ZIP</label><input type="text" id="as-zip" placeholder="95110" /></div>
            </div>
            <div class="as-error" id="as-signup-error" style="display:none;"></div>
            <button class="as-submit" id="as-signup-btn">Create account & save address</button>
            <p class="as-powered">Powered by <a href="https://address-sync.vercel.app" target="_blank">AddressSync</a></p>
          </div>

          <!-- Step 3: Success -->
          <div id="as-step-success" style="display:none;">
            <div class="as-success">
              <div class="as-success-icon">✓</div>
              <h3 style="margin:0 0 8px;font-size:16px;" id="as-success-title">You're all set!</h3>
              <p style="font-size:13px;color:#666;" id="as-success-msg">Your address is now synced. When you move, update once at AddressSync and every connected merchant ships to the right place automatically.</p>
              <button class="as-submit" id="as-done-btn" style="margin-top:16px;">Done</button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      // Close
      document.getElementById('as-close-btn').addEventListener('click', () => document.body.removeChild(overlay));

      // Choose paths
      document.getElementById('as-choose-login').addEventListener('click', () => {
        document.getElementById('as-step-choose').style.display = 'none';
        document.getElementById('as-step-login').style.display = 'block';
      });

      document.getElementById('as-choose-signup').addEventListener('click', () => {
        document.getElementById('as-step-choose').style.display = 'none';
        document.getElementById('as-step-signup').style.display = 'block';
      });

      // Back buttons
      document.getElementById('as-back-from-login').addEventListener('click', () => {
        document.getElementById('as-step-login').style.display = 'none';
        document.getElementById('as-step-choose').style.display = 'block';
      });

      document.getElementById('as-back-from-signup').addEventListener('click', () => {
        document.getElementById('as-step-signup').style.display = 'none';
        document.getElementById('as-step-choose').style.display = 'block';
      });

      // Google buttons
      document.getElementById('as-google-login-btn').addEventListener('click', () => {
        window.open('https://address-sync.vercel.app/login?merchant_token=' + token, '_blank', 'width=500,height=600');
      });

      document.getElementById('as-google-signup-btn').addEventListener('click', () => {
        window.open('https://address-sync.vercel.app/signup?merchant_token=' + token, '_blank', 'width=500,height=600');
      });

      // Login submit
      document.getElementById('as-login-btn').addEventListener('click', async () => {
        const email = document.getElementById('as-login-email').value;
        const password = document.getElementById('as-login-password').value;
        const errorEl = document.getElementById('as-login-error');
        if (!email || !password) {
          errorEl.textContent = 'Please fill in all fields.';
          errorEl.style.display = 'block';
          return;
        }
        document.getElementById('as-login-btn').textContent = 'Signing in...';
        const res = await fetch('https://address-sync.vercel.app/api/widget-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, token })
        });
        const data = await res.json();
        if (!res.ok) {
          errorEl.textContent = data.error || 'Invalid email or password.';
          errorEl.style.display = 'block';
          document.getElementById('as-login-btn').textContent = 'Sign in & fetch my address';
          return;
        }
        document.getElementById('as-step-login').style.display = 'none';
        document.getElementById('as-success-title').textContent = 'Address fetched!';
        document.getElementById('as-success-msg').textContent = 'Your current address has been shared with this merchant. When you move, update once at AddressSync and they\'ll always ship to the right place.';
        document.getElementById('as-step-success').style.display = 'block';
        document.getElementById('as-done-btn').addEventListener('click', () => document.body.removeChild(overlay));
      });

      // Signup submit
      document.getElementById('as-signup-btn').addEventListener('click', async () => {
        const name = document.getElementById('as-name').value;
        const email = document.getElementById('as-email').value;
        const password = document.getElementById('as-password').value;
        const street = document.getElementById('as-street').value;
        const city = document.getElementById('as-city').value;
        const state = document.getElementById('as-state').value;
        const zip = document.getElementById('as-zip').value;
        const errorEl = document.getElementById('as-signup-error');
        if (!name || !email || !password || !street || !city || !state || !zip) {
          errorEl.textContent = 'Please fill in all fields.';
          errorEl.style.display = 'block';
          return;
        }
        document.getElementById('as-signup-btn').textContent = 'Creating account...';
        const res = await fetch('https://address-sync.vercel.app/api/widget-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, street, city, state, zip, token })
        });
        const data = await res.json();
        if (!res.ok) {
          errorEl.textContent = data.error || 'Something went wrong. Please try again.';
          errorEl.style.display = 'block';
          document.getElementById('as-signup-btn').textContent = 'Create account & save address';
          return;
        }
        document.getElementById('as-step-signup').style.display = 'none';
        document.getElementById('as-step-success').style.display = 'block';
        document.getElementById('as-done-btn').addEventListener('click', () => document.body.removeChild(overlay));
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();