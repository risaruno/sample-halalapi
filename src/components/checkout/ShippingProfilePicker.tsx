import { useState } from 'react'
import { User, Phone, MapPin, Trash2, ChevronDown, ChevronUp, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { useLanguage } from '../../contexts/LanguageContext'
import { useShippingProfiles } from '../../hooks/useShippingProfiles'
import type { ShippingProfile } from '../../types'

interface ShippingFormSnapshot {
  recipient_name: string
  phone: string
  line1: string
  line2: string
  city: string
  postal_code: string
  country: string
  notes: string
}

interface Props {
  current: ShippingFormSnapshot
  onLoad: (profile: ShippingProfile) => void
}

export default function ShippingProfilePicker({ current, onLoad }: Props) {
  const { t } = useLanguage()
  const { profiles, addProfile, deleteProfile } = useShippingProfiles()
  const [expanded, setExpanded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [labelInput, setLabelInput] = useState('')

  const handleSave = () => {
    const label = labelInput.trim()
    if (!label) return
    addProfile({ label, ...current })
    toast.success(t.profiles.saved)
    setLabelInput('')
    setSaving(false)
    setExpanded(true)
  }

  const handleDelete = (id: string) => {
    deleteProfile(id)
    toast.success(t.profiles.deleted)
  }

  return (
    <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 text-sm font-semibold text-teal-800 hover:text-teal-900"
        >
          <User size={15} />
          {t.profiles.title}
          {profiles.length > 0 && (
            <span className="bg-teal-200 text-teal-800 text-xs font-bold px-1.5 py-0.5 rounded-full">
              {profiles.length}
            </span>
          )}
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {/* Save-as-profile action */}
        {!saving ? (
          <button
            type="button"
            onClick={() => { setSaving(true); setExpanded(true) }}
            className="flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:text-teal-900 border border-teal-300 hover:border-teal-500 bg-white rounded-lg px-2.5 py-1.5 transition-colors"
          >
            <Save size={13} />
            {t.profiles.saveAs}
          </button>
        ) : null}
      </div>

      {/* Save-as form */}
      {saving && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={labelInput}
            onChange={(e) => setLabelInput(e.target.value)}
            placeholder={t.profiles.profileNamePlaceholder}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
            autoFocus
            className="flex-1 px-3 py-1.5 text-sm border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={!labelInput.trim()}
            className="px-3 py-1.5 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-40 transition-colors"
          >
            {t.profiles.confirm}
          </button>
          <button
            type="button"
            onClick={() => { setSaving(false); setLabelInput('') }}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg bg-white transition-colors"
          >
            {t.profiles.cancel}
          </button>
        </div>
      )}

      {/* Profile list */}
      {expanded && (
        <div className="mt-3 space-y-2">
          {profiles.length === 0 ? (
            <p className="text-xs text-teal-600 italic">{t.profiles.noProfiles}</p>
          ) : (
            profiles.map((p) => (
              <div
                key={p.id}
                className="flex items-start gap-3 bg-white border border-teal-100 rounded-lg px-3 py-2.5"
              >
                {/* Profile info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{p.label}</p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <User size={11} /> {p.recipient_name}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Phone size={11} /> {p.phone}
                    </span>
                  </div>
                  {p.line1 && (
                    <span className="flex items-center gap-1 text-xs text-gray-400 mt-0.5 truncate">
                      <MapPin size={11} /> {p.postal_code} {p.line1}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => { onLoad(p); setExpanded(false) }}
                    className="text-xs font-medium text-teal-700 hover:text-teal-900 border border-teal-300 hover:border-teal-500 bg-teal-50 rounded-md px-2.5 py-1 transition-colors"
                  >
                    {t.profiles.load}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title={t.profiles.delete}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
