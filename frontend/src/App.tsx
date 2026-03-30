import { useState, useRef, useEffect, useMemo } from 'react';
import './App.css';

// --- Interfaces ---
interface RecipeData {
  title: string;
  reasoning: string;
  safe_ingredients: string[];
  instructions: string[];
}

interface Message {
  role: 'user' | 'ai';
  content?: string;
  recipe?: RecipeData;
}

// --- Professional SVG Icons ---
const RobotIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8" /><rect x="4" y="8" width="16" height="12" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);
const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
);
const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line></svg>
);
const ActivityIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
);
const CheckSquareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
);
const ZapIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
);

// --- Icons for Responsive Navigation ---
const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);
const TargetIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
);
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

// --- DETERMINISTIC Smart Macro Estimator ---
const estimateMacros = (ingredientName: string) => {
  const name = ingredientName.toLowerCase();
  let p = name.length % 3; 
  let c = name.length % 4;   
  let f = name.length % 3;

  if (/beef|chicken|pork|fish|egg|turkey/i.test(name)) { p += 22; f += 8; c = 0; }
  else if (/cheese|yogurt|milk/i.test(name)) { p += 7; c += 4; f += 6; }
  else if (/bun|bread|rice|pasta|flour|sugar|potato|oat|crust/i.test(name)) { p += 3; c += 28; f += 1; }
  else if (/nut|almond|peanut/i.test(name)) { p += 6; c += 5; f += 14; }
  else if (/oil|butter|mayo/i.test(name)) { p = 0; c = 0; f += 12; }
  else if (/lettuce|tomato|avocado|mushroom|onion|vegetable/i.test(name)) { 
    p += 1; c += 4; 
    if (/avocado/i.test(name)) f += 15; 
  }
  
  const cal = (p * 4) + (c * 4) + (f * 9);
  return { protein: p, carbs: c, fat: f, calories: cal };
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); 
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Responsive Screen Size State ---
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showLeftDrawer, setShowLeftDrawer] = useState(false);
  const [showRightDrawer, setShowRightDrawer] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isDesktop = windowWidth >= 1024;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isMobile = windowWidth < 768;

  const showNativeLeft = isDesktop;
  const showNativeRight = isDesktop || isTablet;

  useEffect(() => {
    if (showNativeLeft) setShowLeftDrawer(false);
    if (showNativeRight) setShowRightDrawer(false);
  }, [showNativeLeft, showNativeRight]);

  // --- Interactive States ---
  const healthObjectives = ['General Wellness', 'Heart Health', 'Gut Microbiome', 'Athletic Recovery'];
  const [activeObjective, setActiveObjective] = useState<string>('General Wellness');
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  // --- Theme Engine ---
  const theme = isDarkMode ? {
    bg: '#0f172a', surface: '#1e293b', border: '#334155', textMain: '#f8fafc', textMuted: '#94a3b8',
    accent: '#0ea5e9', userBubble: '#1e293b', aiBubble: 'transparent', inputBg: '#1e293b',
    cardBg: '#0f172a', danger: '#ef4444', success: '#10b981', warning: '#f59e0b'
  } : {
    bg: '#f8fafc', surface: '#ffffff', border: '#e2e8f0', textMain: '#0f172a', textMuted: '#64748b',
    accent: '#0ea5e9', userBubble: '#f1f5f9', aiBubble: 'transparent', inputBg: '#ffffff',
    cardBg: '#f8fafc', danger: '#ef4444', success: '#10b981', warning: '#f59e0b'
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => scrollToBottom(), [messages]);

  const handleNewChat = () => {
    setMessages([]);
    if (isMobile) setShowLeftDrawer(false);
  };

  const sendMessage = async (textToSend = input) => {
    if (!textToSend.trim()) return;
    const userMessage = textToSend.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);
    if (isMobile) setShowLeftDrawer(false);

    try {
      const historyForBackend = messages.map(m => ({
        role: m.role, content: m.content || (m.recipe ? `Generated recipe: ${m.recipe.title}` : '')
      }));
      // Inject the selected objective into the AI prompt
      historyForBackend.push({ role: 'user', content: `[Focus: ${activeObjective}] ${userMessage}` });

      const response = await fetch('http://localhost:8000/api/generate-meal/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ household_id: 1, messages: historyForBackend })
      });

      if (!response.ok) throw new Error("Backend connection failed");
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', recipe: { title: data.title, reasoning: data.reasoning, safe_ingredients: data.safe_ingredients, instructions: data.instructions } }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', content: "Error: Disconnected from clinical database." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // --- Right Pane Logic ---
  const latestRecipeMsg = [...messages].reverse().find(m => m.role === 'ai' && m.recipe);
  const activeRecipe = latestRecipeMsg?.recipe;

  useEffect(() => {
    if (activeRecipe?.safe_ingredients) {
      const initialChecks: Record<string, boolean> = {};
      activeRecipe.safe_ingredients.forEach(ing => initialChecks[ing] = true);
      setCheckedIngredients(initialChecks);
    }
  }, [activeRecipe?.safe_ingredients]);

  const toggleIngredient = (ing: string) => setCheckedIngredients(prev => ({ ...prev, [ing]: !prev[ing] }));

  const nutritionData = useMemo(() => {
    if (!activeRecipe) return null;
    let tProtein = 0, tCarbs = 0, tFat = 0, tCals = 0;
    const ingredients = activeRecipe.safe_ingredients.map(ing => {
      const macros = estimateMacros(ing);
      if (checkedIngredients[ing]) { tProtein += macros.protein; tCarbs += macros.carbs; tFat += macros.fat; tCals += macros.calories; }
      return { name: ing, ...macros };
    });
    return { totalProtein: tProtein, totalCarbs: tCarbs, totalFat: tFat, totalCalories: tCals, ingredients };
  }, [activeRecipe, checkedIngredients]);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: theme.bg, color: theme.textMain, fontFamily: '"Inter", -apple-system, sans-serif', overflow: 'hidden', position: 'relative' }}>
      
      {/* --- OVERLAY BACKDROP (For Mobile Drawers) --- */}
      {(!showNativeLeft && showLeftDrawer) || (!showNativeRight && showRightDrawer) ? (
        <div 
          onClick={() => { setShowLeftDrawer(false); setShowRightDrawer(false); }}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 40, animation: 'fadeIn 0.2s ease-in' }}
        />
      ) : null}

      {/* ========================================== */}
      {/* LEFT PANE: Minimalist Controls             */}
      {/* ========================================== */}
      <aside style={{ 
        width: isMobile ? '85%' : '280px', 
        maxWidth: '320px',
        backgroundColor: theme.surface, 
        borderRight: `1px solid ${theme.border}`, 
        display: 'flex', 
        flexDirection: 'column', 
        flexShrink: 0, 
        zIndex: 50,
        position: showNativeLeft ? 'static' : 'fixed',
        top: 0, bottom: 0,
        left: showNativeLeft ? '0' : (showLeftDrawer ? '0' : '-100%'),
        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: !showNativeLeft && showLeftDrawer ? '4px 0 24px rgba(0,0,0,0.2)' : 'none'
      }}>
        
        <div style={{ padding: '20px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Diet Engine
          </h1>
          {!showNativeLeft && (
            <button onClick={() => setShowLeftDrawer(false)} style={{ background: 'transparent', border: 'none', color: theme.textMuted, cursor: 'pointer', padding: '4px' }}>
              <CloseIcon />
            </button>
          )}
        </div>

        <div style={{ padding: '24px 20px', flex: 1, overflowY: 'auto' }}>

          {/* Primary Health Objective */}
          <div style={{ marginBottom: '32px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: theme.textMuted, display: 'block', marginBottom: '12px' }}>Primary Objective</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {healthObjectives.map((obj) => (
                <button
                  key={obj} onClick={() => setActiveObjective(obj)}
                  style={{
                    padding: '10px 8px', backgroundColor: activeObjective === obj ? theme.cardBg : 'transparent',
                    border: `1px solid ${activeObjective === obj ? theme.accent : theme.border}`, borderRadius: '8px',
                    fontSize: '0.75rem', fontWeight: activeObjective === obj ? '600' : 'normal',
                    color: activeObjective === obj ? theme.textMain : theme.textMuted, cursor: 'pointer',
                    transition: 'all 0.2s ease', textAlign: 'center',
                    boxShadow: activeObjective === obj ? `0 0 0 1px ${theme.accent} inset` : 'none'
                  }}
                >{obj}</button>
              ))}
            </div>
          </div>

          {/* Quick Prompts */}
          <div style={{ marginBottom: '32px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: theme.textMuted, display: 'block', marginBottom: '12px' }}>Quick Prompts</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['High-protein breakfast', '15-minute dinner', 'Heart-healthy snack', 'Low-GI dessert'].map((prompt, i) => (
                <button
                  key={i} onClick={() => sendMessage(prompt)}
                  style={{ padding: '8px 12px', backgroundColor: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '20px', fontSize: '0.8rem', color: theme.textMain, cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.color = theme.accent; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textMain; }}
                ><ZapIcon /> {prompt}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '20px', borderTop: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button onClick={handleNewChat} style={{ width: '100%', backgroundColor: theme.accent, border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '600', transition: 'all 0.2s' }}>
            <PlusIcon /> Clear Workspace
          </button>
          <button onClick={() => setIsDarkMode(!isDarkMode)} style={{ width: '100%', backgroundColor: 'transparent', border: `1px solid ${theme.border}`, padding: '10px', borderRadius: '8px', cursor: 'pointer', color: theme.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}>
            {isDarkMode ? <SunIcon /> : <MoonIcon />}
            <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </aside>

      {/* ========================================== */}
      {/* CENTER PANE: AI Chat Interface             */}
      {/* ========================================== */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', minWidth: 0 }}>
        
        {/* Mobile/Tablet Header Bar */}
        {(!showNativeLeft || !showNativeRight) && (
          <header style={{ padding: '16px 20px', backgroundColor: theme.surface, borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
            {!showNativeLeft ? (
              <button onClick={() => setShowLeftDrawer(true)} style={{ background: 'transparent', border: 'none', color: theme.textMain, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <MenuIcon />
              </button>
            ) : <div />}
            
            <span style={{ fontWeight: '600', fontSize: '1rem', color: theme.textMain }}>Diet Engine</span>
            
            {!showNativeRight ? (
              <button onClick={() => setShowRightDrawer(true)} style={{ background: 'transparent', border: 'none', color: theme.accent, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <TargetIcon />
              </button>
            ) : <div />}
          </header>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '20px 16px' : '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '20px' }}>
            
            {messages.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: '10vh', gap: '20px', opacity: 0.8 }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: theme.surface, border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.accent }}>
                  <RobotIcon />
                </div>
                <h2 style={{ fontSize: isMobile ? '1.2rem' : '1.4rem', fontWeight: '600', margin: 0 }}>Clinical Engine Ready</h2>
                <p style={{ color: theme.textMuted, textAlign: 'center', fontSize: '0.95rem', maxWidth: '400px', margin: 0, padding: '0 20px' }}>
                  I will design custom meal plans based on your active objective.
                </p>
              </div>
            )}

            {messages.map((msg, index) => (
              <div key={index} style={{ display: 'flex', gap: isMobile ? '10px' : '16px', width: '100%', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                {msg.role === 'ai' && !isMobile && (
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: theme.accent, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '4px' }}>
                    <RobotIcon />
                  </div>
                )}

                <div style={{ maxWidth: isMobile ? '95%' : '85%', width: msg.role === 'ai' && isMobile ? '100%' : 'auto', backgroundColor: msg.role === 'user' ? theme.userBubble : theme.aiBubble, padding: msg.role === 'user' ? '12px 16px' : (isMobile ? '0' : '4px 0'), borderRadius: '12px', border: msg.role === 'user' && !isDarkMode ? `1px solid ${theme.border}` : 'none', fontSize: isMobile ? '0.95rem' : '1rem', lineHeight: '1.6' }}>
                  {msg.content && <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>}

                  {msg.role === 'ai' && msg.recipe && (
                    <div style={{ backgroundColor: theme.surface, borderRadius: '12px', border: `1px solid ${theme.border}`, overflow: 'hidden', marginTop: msg.content ? '12px' : '0' }}>
                      <div style={{ padding: isMobile ? '16px' : '20px', borderBottom: `1px solid ${theme.border}` }}>
                        <h3 style={{ margin: 0, fontSize: isMobile ? '1.1rem' : '1.2rem', fontWeight: '600' }}>{msg.recipe.title}</h3>
                      </div>
                      <div style={{ padding: isMobile ? '16px' : '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: theme.accent, display: 'block', marginBottom: '8px' }}>Safety Reasoning</span>
                          <p style={{ margin: 0, color: theme.textMuted, fontSize: '0.9rem' }}>{msg.recipe.reasoning}</p>
                        </div>
                        {msg.recipe.instructions && msg.recipe.instructions.length > 0 && (
                          <div style={{ paddingTop: '20px', borderTop: `1px solid ${theme.border}` }}>
                             <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: theme.textMuted, display: 'block', marginBottom: '16px' }}>Preparation Steps</span>
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                               {msg.recipe.instructions.map((step, i) => (
                                 <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                   <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: theme.bg, border: `1px solid ${theme.border}`, color: theme.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '600', flexShrink: 0, marginTop: '2px' }}>{i + 1}</div>
                                   <span style={{ color: theme.textMain, lineHeight: '1.6', fontSize: '0.9rem' }}>{step}</span>
                                 </div>
                               ))}
                             </div>
                          </div>
                        )}
                        {/* Mobile specific call to action */}
                        {isMobile && !showNativeRight && (
                           <button onClick={() => setShowRightDrawer(true)} style={{ width: '100%', marginTop: '10px', padding: '12px', backgroundColor: theme.bg, border: `1px dashed ${theme.accent}`, borderRadius: '8px', color: theme.accent, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' }}>
                             <TargetIcon /> View Macros & Groceries
                           </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Footer */}
        <div style={{ padding: isMobile ? '12px' : '20px', display: 'flex', justifyContent: 'center', backgroundColor: isDarkMode ? 'transparent' : '#ffffff', backgroundImage: isDarkMode ? 'linear-gradient(to top, #0f172a 50%, transparent)' : 'none', zIndex: 10 }}>
          <div style={{ width: '100%', maxWidth: '700px', position: 'relative' }}>
            <textarea 
              value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyPress} disabled={isLoading}
              placeholder="Message Diet Engine..." rows={1}
              style={{ width: '100%', padding: '16px 50px 16px 20px', borderRadius: '24px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, fontSize: '1rem', outline: 'none', color: theme.textMain, resize: 'none', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            />
            <button 
              onClick={() => sendMessage(input)} disabled={isLoading || !input.trim()}
              style={{ position: 'absolute', right: '8px', top: '8px', bottom: '8px', width: '36px', backgroundColor: input.trim() ? theme.accent : theme.border, color: input.trim() ? 'white' : theme.textMuted, border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </main>

      {/* ========================================== */}
      {/* RIGHT PANE: Interactive Macro Builder      */}
      {/* ========================================== */}
      <aside style={{ 
        width: isMobile ? '85%' : (isTablet ? '320px' : '380px'), 
        maxWidth: '400px',
        backgroundColor: theme.surface, 
        borderLeft: `1px solid ${theme.border}`, 
        display: 'flex', 
        flexDirection: 'column', 
        flexShrink: 0, 
        zIndex: 50,
        position: showNativeRight ? 'static' : 'fixed',
        top: 0, bottom: 0,
        right: showNativeRight ? '0' : (showRightDrawer ? '0' : '-100%'),
        transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: !showNativeRight && showRightDrawer ? '-4px 0 24px rgba(0,0,0,0.2)' : 'none'
      }}>
        
        <div style={{ padding: '20px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ActivityIcon />
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Active Meal Plan</h2>
          </div>
          {!showNativeRight && (
            <button onClick={() => setShowRightDrawer(false)} style={{ background: 'transparent', border: 'none', color: theme.textMuted, cursor: 'pointer', padding: '4px' }}>
              <CloseIcon />
            </button>
          )}
        </div>

        <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
          {!activeRecipe || !nutritionData ? (
             <div style={{ textAlign: 'center', color: theme.textMuted, marginTop: '40px', fontSize: '0.9rem' }}>
               Generate a recipe in the chat to see detailed nutritional analysis here.
             </div>
          ) : (
            <div style={{ animation: 'fadeIn 0.5s ease-in' }}>
              
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: theme.textMain, lineHeight: '1.4' }}>{activeRecipe.title}</h3>

              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: theme.textMuted, display: 'block', marginBottom: '12px' }}>Total Estimates</span>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ backgroundColor: theme.cardBg, padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                    <div style={{ color: theme.textMuted, fontSize: '0.75rem', marginBottom: '4px' }}>Calories</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>{nutritionData.totalCalories}</div>
                  </div>
                  <div style={{ backgroundColor: theme.cardBg, padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                    <div style={{ color: theme.textMuted, fontSize: '0.75rem', marginBottom: '4px' }}>Protein</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: theme.success }}>{nutritionData.totalProtein}g</div>
                  </div>
                  <div style={{ backgroundColor: theme.cardBg, padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                    <div style={{ color: theme.textMuted, fontSize: '0.75rem', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                      Net Carbs 
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: theme.accent }}>{nutritionData.totalCarbs}g</div>
                  </div>
                  <div style={{ backgroundColor: theme.cardBg, padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                    <div style={{ color: theme.textMuted, fontSize: '0.75rem', marginBottom: '4px' }}>Fat</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: theme.warning }}>{nutritionData.totalFat}g</div>
                  </div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: theme.textMuted, display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <CheckSquareIcon /> Ingredient Macros
                </span>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {nutritionData.ingredients.map((ing, i) => {
                    const isChecked = checkedIngredients[ing.name] !== false; 
                    return (
                      <label 
                        key={i} 
                        style={{ 
                          padding: '12px', backgroundColor: isChecked ? theme.cardBg : 'transparent', border: `1px solid ${isChecked ? theme.border : 'transparent'}`, 
                          borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', transition: 'all 0.2s', opacity: isChecked ? 1 : 0.6
                        }}
                      >
                        <input type="checkbox" checked={isChecked} onChange={() => toggleIngredient(ing.name)} style={{ width: '16px', height: '16px', accentColor: theme.accent, cursor: 'pointer', marginTop: '2px' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                          <span style={{ fontSize: '0.9rem', color: theme.textMain, fontWeight: '500', textDecoration: isChecked ? 'none' : 'line-through' }}>{ing.name}</span>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: theme.textMuted }}>
                            <span style={{ color: theme.textMuted }}>{ing.calories} kcal</span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <span style={{ color: theme.success }}>P:{ing.protein}</span>
                              <span style={{ color: theme.accent }}>C:{ing.carbs}</span>
                              <span style={{ color: theme.warning }}>F:{ing.fat}</span>
                            </div>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </div>
      </aside>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        textarea::placeholder { color: ${theme.textMuted}; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${theme.border}; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #64748b; }
      `}</style>
    </div>
  );
}