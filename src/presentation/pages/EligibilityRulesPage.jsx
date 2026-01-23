import { useState, useEffect } from 'react'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import { fetchRules, updateRule, recalculateAllScores, fetchRulesHistory, saveRuleHistory, restoreRuleVersion } from '../../infrastructure/services/ruleService'
import { getScoreThresholds, updateScoreThreshold } from '../../infrastructure/services/thresholdService'
import { useAuth } from '../../presentation/context/AuthContext'
import RuleHistorySlider from '../components/dashboard/RuleHistorySlider'
import './EligibilityRulesPage.css'

/**
 * Eligibility Rules Page Component
 * Displays and allows editing of calculation criteria
 */
const EligibilityRulesPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024)
  const [rules, setRules] = useState([]);
  const [thresholds, setThresholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingThresholdId, setEditingThresholdId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [thresholdEditValues, setThresholdEditValues] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [isRestoring, setIsRestoring] = useState(false);
  const { user } = useAuth();

  // Handle window resize for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setIsSidebarOpen(true)
      } else {
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Load data from Supabase
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rulesData, thresholdsData] = await Promise.all([
        fetchRules(),
        getScoreThresholds()
      ]);
      setRules(rulesData);
      setThresholds(thresholdsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const startEditing = (rule) => {
    setEditingId(rule.id);
    setEditValues({
      min_value: rule.min_value,
      max_value: rule.max_value,
      weight_pct: rule.weight_pct
    });
  };

  const handleEditChange = (field, value) => {
    setEditValues(prev => ({
      ...prev,
      [field]: value === '' ? null : parseFloat(value)
    }));
  };

  const saveChanges = async (id) => {
    setUpdating(true);
    try {
      await updateRule(id, editValues);
      setEditingId(null);
      const data = await fetchRules();
      setRules(data);
    } catch (error) {
      console.error('Failed to update rule:', error);
      alert('Failed to save changes.');
    } finally {
      setUpdating(false);
    }
  };

  const startEditingThreshold = (threshold) => {
    setEditingThresholdId(threshold.id);
    setThresholdEditValues({
      min_value: threshold.min_value
    });
  };

  const saveThresholdChanges = async (id) => {
    setUpdating(true);
    try {
      await updateScoreThreshold(id, thresholdEditValues);
      setEditingThresholdId(null);
      const data = await getScoreThresholds();
      setThresholds(data);
    } catch (error) {
      console.error('Failed to update threshold:', error);
      alert('Failed to save threshold changes.');
    } finally {
      setUpdating(false);
    }
  };

  const handleRecalculate = async () => {
    setShowConfirmModal(true);
  };

  const confirmRecalculate = async () => {
    setShowConfirmModal(false);
    setUpdating(true);
    try {
      await recalculateAllScores();

      // Save history snapshot when recalculation is triggered
      if (user) {
        await saveRuleHistory({
          name: user.name,
          email: user.email,
          avatar_url: user.avatar_url
        });
      }

      setNotification({ type: 'success', message: 'All customer scores updated and version saved to history!' });
    } catch (error) {
      console.error('Recalculation failed:', error);
      setNotification({ type: 'error', message: 'Sync failed. Please check your connection.' });
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenHistory = async () => {
    try {
      const data = await fetchRulesHistory();
      setHistoryData(data || []);
      setIsHistoryOpen(true);
    } catch (error) {
      console.error('Failed to load history:', error);
      setNotification({ type: 'error', message: 'Failed to load history records.' });
    }
  };

  const handleRestoreVersion = async (record) => {
    if (!window.confirm('Are you sure you want to restore these numbers? You will need to click "Re-Calculate All" to apply them to all customers.')) {
      return;
    }

    setIsRestoring(true);
    try {
      // 1. Restore rule and threshold values in DB
      await restoreRuleVersion(record);

      // 2. Reload UI data to show the restored numbers
      await loadData();

      setNotification({ type: 'success', message: 'Numbers restored! Click "Re-Calculate All" to apply changes.' });
      setIsHistoryOpen(false);
    } catch (error) {
      console.error('Restore failed:', error);
      setNotification({ type: 'error', message: 'Failed to restore version.' });
    } finally {
      setIsRestoring(false);
    }
  };

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Group rules by category
  const categoriesMap = {
    'Financial': 'Finance',
    'Employment': 'Employment',
    'Personal': 'Personal',
    'Family': 'Family'
  };

  const categories = ['Finance', 'Employment', 'Personal', 'Family'];

  // Calculate category weights (Sum of max weights for each unique rule in category)
  const categoryWeights = rules.reduce((acc, rule) => {
    const uiCategory = categoriesMap[rule.category] || rule.category;
    if (!acc[uiCategory]) acc[uiCategory] = {};

    // Store max weight per rule_name within the category
    const weight = parseFloat(rule.weight_pct) || 0;
    if (!acc[uiCategory][rule.rule_name] || weight > acc[uiCategory][rule.rule_name]) {
      acc[uiCategory][rule.rule_name] = weight;
    }
    return acc;
  }, {});

  const categoryTotals = Object.keys(categoryWeights).reduce((acc, cat) => {
    acc[cat] = Object.values(categoryWeights[cat]).reduce((sum, w) => sum + w, 0);
    return acc;
  }, {});

  // Custom label order for sorting Weak -> Strong
  const labelOrder = { 'Weak': 1, 'Fair': 2, 'Good': 3, 'Strong': 4 };

  const filteredRules = rules
    .filter(r =>
      r.rule_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Sort by category first to match groups
      const catA = categoriesMap[a.category] || a.category;
      const catB = categoriesMap[b.category] || b.category;
      if (catA !== catB) return categories.indexOf(catA) - categories.indexOf(catB);
      // Then sort by rule name to group them
      if (a.rule_name !== b.rule_name) return a.rule_name.localeCompare(b.rule_name);
      // Then sort by label order: Weak -> Fair -> Good -> Strong
      return (labelOrder[a.label] || 0) - (labelOrder[b.label] || 0);
    });

  const getRulesByCategory = (categoryName) => {
    return filteredRules.filter(r => (categoriesMap[r.category] || r.category) === categoryName);
  };

  return (
    <div className="eligibility-rules-page">
      <DashboardHeader onMenuClick={toggleSidebar} />
      <div className="dashboard-layout">
        {isSidebarOpen && window.innerWidth <= 1024 && (
          <div className="sidebar-backdrop visible" onClick={toggleSidebar} />
        )}
        <DashboardSidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
        <div className={`dashboard-main ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          <main className="eligibility-rules-content">
            {/* Header Section */}
            <div className="eligibility-rules-page-header">
              <div className="title-group">
                <h1 className="page-title">Eligibility Rules</h1>
                <p className="page-subtitle">Manage criteria and weights for credit scoring. Updates reflect immediately.</p>
              </div>
              <div className="page-actions">
                <button
                  className="action-button history-button"
                  onClick={handleOpenHistory}
                  title="View edit history"
                >
                  <span className="material-icons-outlined">history</span>
                  <span>History</span>
                </button>
                <button
                  className={`action-button recalculate-button ${updating ? 'loading' : ''}`}
                  onClick={handleRecalculate}
                  disabled={updating}
                  title="Manually trigger a full system refresh"
                >
                  <span>{updating ? 'Processing...' : 'Re-Calculate All'}</span>
                </button>
              </div>
            </div>

            {loading && rules.length === 0 ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading settings...</p>
              </div>
            ) : (
              <div className="rules-categories-container">
                {/* Score Thresholds Section */}
                <section className="category-section thresholds-section">
                  <div className="category-header">
                    <div className="header-title-group">
                      <h2 className="category-title">Final Scoring Decision Making</h2>
                      <p className="section-description">Define what score counts as Green, Yellow, or Amber.</p>
                    </div>
                  </div>
                  <div className="thresholds-grid">
                    {thresholds.map((threshold, index) => {
                      const isEditing = editingThresholdId === threshold.id;
                      const nextThreshold = thresholds[index - 1]; // Sorted by sort_order 1 (Green), 2 (Yellow), 3 (Amber)

                      return (
                        <div key={threshold.id} className={`threshold-card status-${threshold.label.toLowerCase()} ${isEditing ? 'editing' : ''}`}>
                          <div className="threshold-color-indicator" style={{ backgroundColor: threshold.color_code }}></div>
                          <div className="threshold-content">
                            <div className="threshold-info">
                              <span className="threshold-label">{threshold.label} Status</span>
                              {isEditing ? (
                                <div className="threshold-edit-box">
                                  <label>Minimum Score Required</label>
                                  <div className="threshold-input-wrapper">
                                    <input
                                      type="number"
                                      value={thresholdEditValues.min_value ?? ''}
                                      onChange={(e) => setThresholdEditValues({ min_value: parseFloat(e.target.value) })}
                                      autoFocus
                                    />
                                    <span className="unit-pct">pts</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="threshold-display">
                                  <div className="main-range">
                                    <span className="range-text">Scores <strong>{threshold.min_value}+</strong></span>
                                  </div>
                                  <div className="range-sub">
                                    {nextThreshold ? (
                                      <span>Up to {nextThreshold.min_value - 0.01} pts</span>
                                    ) : (
                                      <span>Full range coverage</span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="threshold-actions">
                              {isEditing ? (
                                <div className="mini-actions">
                                  <button className="btn-confirm-mini" onClick={() => saveThresholdChanges(threshold.id)} disabled={updating}>
                                    <span className="material-icons-outlined">done</span>
                                  </button>
                                  <button className="btn-cancel-mini" onClick={() => setEditingThresholdId(null)} disabled={updating}>
                                    <span className="material-icons-outlined">close</span>
                                  </button>
                                </div>
                              ) : (
                                <button className="btn-edit-threshold" onClick={() => startEditingThreshold(threshold)}>
                                  <span className="material-icons-outlined">edit</span>
                                  <span>Edit</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>

                {/* Eligibility Weight Section */}
                <section className="category-section weights-overview-section">
                  <div className="category-header">
                    <div className="header-title-group">
                      <h2 className="category-title">Eligibility Weight</h2>
                      <p className="section-description">Breakdown of how each eligibility rule weight</p>
                    </div>
                  </div>
                  <div className="weights-visualization-card">
                    <div className="weight-progress-bar">
                      <div className="segment finance" style={{ width: `${categoryTotals['Finance'] || 0}%` }}></div>
                      <div className="segment employment" style={{ width: `${categoryTotals['Employment'] || 0}%` }}></div>
                      <div className="segment personal" style={{ width: `${categoryTotals['Personal'] || 0}%` }}></div>
                      <div className="segment family" style={{ width: `${categoryTotals['Family'] || 0}%` }}></div>
                    </div>
                    <div className="weights-legend">
                      <div className="legend-item"><span className="dot finance"></span> <span className="legend-cat">Finance</span> <span className="legend-val">{categoryTotals['Finance'] || 0}%</span></div>
                      <div className="legend-item"><span className="dot employment"></span> <span className="legend-cat">Employment</span> <span className="legend-val">{categoryTotals['Employment'] || 0}%</span></div>
                      <div className="legend-item"><span className="dot personal"></span> <span className="legend-cat">Personal</span> <span className="legend-val">{categoryTotals['Personal'] || 0}%</span></div>
                      <div className="legend-item"><span className="dot family"></span> <span className="legend-cat">Family</span> <span className="legend-val">{categoryTotals['Family'] || 0}%</span></div>
                    </div>
                  </div>
                </section>

                {categories.map(category => {
                  const categoryRules = getRulesByCategory(category);
                  if (categoryRules.length === 0 && searchTerm) return null;

                  return (
                    <section key={category} className="category-section">
                      <div className="category-header">
                        <h2 className="category-title">{category} Criteria</h2>
                        <div className="rules-counter-badge">
                          <span>{categoryRules.length / (category === 'Personal' && categoryRules[0]?.rule_name === 'Age' ? 1 : 1)} RULES</span>
                        </div>
                      </div>
                      <div className="rules-grid">
                        {categoryRules.map(rule => {
                          const isEditing = editingId === rule.id;

                          return (
                            <div key={rule.id} className={`rule-card ${isEditing ? 'editing' : ''}`}>
                              <div className="rule-header">
                                <span className="rule-name">{rule.rule_name}</span>
                                <span className={`rule-status-badge status-${rule.label.toLowerCase()}`}>
                                  {rule.label}
                                </span>
                              </div>

                              <div className="rule-details">
                                <div className="detail-group">
                                  <label>Criteria Range</label>
                                  {isEditing ? (
                                    <div className="range-inputs">
                                      <div className="input-with-unit">
                                        <input
                                          type="number"
                                          placeholder="Min"
                                          value={editValues.min_value ?? ''}
                                          onChange={(e) => handleEditChange('min_value', e.target.value)}
                                        />
                                      </div>
                                      <span className="range-sep">to</span>
                                      <div className="input-with-unit">
                                        <input
                                          type="number"
                                          placeholder="Max"
                                          value={editValues.max_value ?? ''}
                                          onChange={(e) => handleEditChange('max_value', e.target.value)}
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="criteria-text">
                                      {rule.min_value !== null && rule.max_value !== null ? (
                                        `${rule.min_value} - ${rule.max_value}`
                                      ) : rule.min_value !== null ? (
                                        `${rule.min_value}+`
                                      ) : (
                                        `Up to ${rule.max_value}`
                                      )}
                                      <span className="unit-label">
                                        {rule.rule_name.includes('Balance') ? 'M' :
                                          rule.rule_name.includes('Rate') ? '%' :
                                            rule.rule_name.includes('Age') || rule.rule_name.includes('Bank') ? ' yrs' : ''}
                                      </span>
                                    </span>
                                  )}
                                </div>

                                <div className="detail-group">
                                  <label>Weight Impact</label>
                                  {isEditing ? (
                                    <div className="weight-input-container">
                                      <input
                                        type="number"
                                        step="0.01"
                                        className="weight-input-edit"
                                        value={editValues.weight_pct ?? ''}
                                        onChange={(e) => handleEditChange('weight_pct', e.target.value)}
                                      />
                                      <span className="pct-symbol">%</span>
                                    </div>
                                  ) : (
                                    <span className="weight-display">{rule.weight_pct}%</span>
                                  )}
                                </div>
                              </div>

                              <div className="rule-card-actions">
                                {isEditing ? (
                                  <>
                                    <button className="btn-save" onClick={() => saveChanges(rule.id)} disabled={updating}>
                                      {updating ? 'Updating...' : 'Save'}
                                    </button>
                                    <button className="btn-cancel" onClick={() => setEditingId(null)} disabled={updating}>
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <button className="btn-edit" onClick={() => startEditing(rule)}>
                                    <span className="material-icons-outlined">edit</span>
                                    Edit
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </section>
                  )
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="custom-modal">
            <div className="modal-header">
              <span className="material-icons-outlined modal-icon">sync</span>
              <h3>Confirm System Sync</h3>
            </div>
            <div className="modal-body">
              <p>This will recalculate eligibility scores for all <strong>39,000+ customers</strong> based on your current rules.</p>
              <p>This process is intensive and may take a few moments to complete.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-modal-cancel" onClick={() => setShowConfirmModal(false)}>Cancel</button>
              <button className="btn-modal-confirm" onClick={confirmRecalculate}>Synchronize Now</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {notification && (
        <div className={`toast-notification ${notification.type}`}>
          <span className="material-icons-outlined">
            {notification.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span className="toast-message">{notification.message}</span>
          <button className="toast-close" onClick={() => setNotification(null)}>
            <span className="material-icons-outlined">close</span>
          </button>
        </div>
      )}

      {/* History Slider */}
      <RuleHistorySlider
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={historyData}
        onRestore={handleRestoreVersion}
        isRestoring={isRestoring}
      />
    </div>
  )
}

export default EligibilityRulesPage
