import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import './RuleHistorySlider.css'

/**
 * Rule History Slider Component
 * Displays version history of eligibility rules edits
 */
const RuleHistorySlider = ({ isOpen, onClose, history, onRestore, isRestoring }) => {
    const [shouldRender, setShouldRender] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)

    // Handle opening animation
    useEffect(() => {
        if (isOpen) {
            setShouldRender(true)
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setIsAnimating(true)
                })
            })
        } else {
            setIsAnimating(false)
            const timer = setTimeout(() => {
                setShouldRender(false)
            }, 400)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    // Close on ESC key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose()
            }
        }
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen, onClose])

    if (!shouldRender) return null

    const getInitials = (name) => {
        if (!name) return '??'
        const parts = name.split(' ')
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase()
        }
        return name.substring(0, 2).toUpperCase()
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <>
            <div
                className={`slider-backdrop ${isAnimating ? 'visible' : ''}`}
                onClick={onClose}
            />

            <div className={`rule-history-slider ${isAnimating ? 'open' : ''}`}>
                <div className="slider-header">
                    <h2 className="slider-title">Update History</h2>
                    <button
                        className="slider-close-btn"
                        onClick={onClose}
                        aria-label="Close history"
                    >
                        <span className="material-icons-outlined">close</span>
                    </button>
                </div>

                <div className="slider-content">
                    <div className="history-list">
                        {history.length === 0 ? (
                            <div className="empty-history">
                                <p>No history records found.</p>
                            </div>
                        ) : (
                            history.map((record) => (
                                <div key={record.id} className="history-item">
                                    <div className="history-editor-cell">
                                        <div className="editor-avatar">
                                            {record.editor_avatar_url ? (
                                                <img src={record.editor_avatar_url} alt={record.editor_name} />
                                            ) : (
                                                <span>{getInitials(record.editor_name)}</span>
                                            )}
                                        </div>
                                        <span className="editor-name">{record.editor_name || 'Editor name'}</span>
                                    </div>

                                    <div className="history-email-cell">
                                        <span className="editor-email">{record.editor_email || 'Email'}</span>
                                    </div>

                                    <div className="history-date-cell">
                                        <span className="history-date-text">{formatDate(record.created_at)}</span>
                                    </div>

                                    <div className="history-action-cell">
                                        <button
                                            className="btn-restore"
                                            onClick={() => onRestore(record)}
                                            disabled={isRestoring}
                                        >
                                            {isRestoring ? 'Wait...' : 'Restore'}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

RuleHistorySlider.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    history: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        created_at: PropTypes.string.isRequired,
        editor_name: PropTypes.string,
        editor_email: PropTypes.string,
        editor_avatar_url: PropTypes.string,
        rules_snapshot: PropTypes.array,
        thresholds_snapshot: PropTypes.array
    })).isRequired,
    onRestore: PropTypes.func.isRequired,
    isRestoring: PropTypes.bool
}

export default RuleHistorySlider
