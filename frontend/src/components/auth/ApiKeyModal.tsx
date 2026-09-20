"use client";
import React, { useState, useEffect } from "react";
import {
  X,
  Key,
  Plus,
  Copy,
  Check,
  Pencil,
  Trash2,
  AlertTriangle,
  Sparkles,
  Lock,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

interface ApiKeyItem {
  key_id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  is_active: boolean;
}

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [newKeyName, setNewKeyName] = useState<string>("");
  const [generating, setGenerating] = useState<boolean>(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<{ name: string; raw_key: string } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Edit Key Name State
  const [editingKey, setEditingKey] = useState<ApiKeyItem | null>(null);
  const [editNameInput, setEditNameInput] = useState<string>("");

  // Delete Confirmation State (Must type project name to delete)
  const [deletingKey, setDeletingKey] = useState<ApiKeyItem | null>(null);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState<string>("");
  const [deletingLoading, setDeletingLoading] = useState<boolean>(false);

  const getApiBase = () => {
    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return rawApiUrl.replace(/\/api\/v1\/?$/, "");
  };

  const fetchKeys = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const token = localStorage.getItem("fintech_os_auth_token");
      if (!token) return;

      const res = await fetch(`${getApiBase()}/api/v1/auth/api-keys`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.api_keys) {
        setKeys(data.api_keys);
      } else {
        setErrorMsg(data.detail || "Failed to load API keys.");
      }
    } catch (err) {
      console.error("Fetch API keys error:", err);
      setErrorMsg("Failed to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchKeys();
      setNewlyCreatedKey(null);
      setCopied(false);
      setNewKeyName("");
      setEditingKey(null);
      setDeletingKey(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      setErrorMsg("Please enter a name for your API key / project.");
      return;
    }

    setGenerating(true);
    setErrorMsg("");
    try {
      const token = localStorage.getItem("fintech_os_auth_token");
      const res = await fetch(`${getApiBase()}/api/v1/auth/api-keys/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.raw_key) {
        setNewlyCreatedKey({ name: data.name, raw_key: data.raw_key });
        setNewKeyName("");
        fetchKeys();
      } else {
        setErrorMsg(data.detail || "Failed to generate API key.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error generating API key.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyKey = () => {
    if (!newlyCreatedKey) return;
    const textToCopy = newlyCreatedKey.raw_key;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        })
        .catch(() => fallbackCopy(textToCopy));
    } else {
      fallbackCopy(textToCopy);
    }
  };

  const fallbackCopy = (text: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      textArea.remove();
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Fallback copy failed", err);
    }
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKey || !editNameInput.trim()) return;

    try {
      const token = localStorage.getItem("fintech_os_auth_token");
      const res = await fetch(`${getApiBase()}/api/v1/auth/api-keys/${editingKey.key_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editNameInput.trim() }),
      });
      if (res.ok) {
        setEditingKey(null);
        fetchKeys();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteKey = async () => {
    if (!deletingKey) return;
    if (deleteConfirmationInput.trim() !== deletingKey.name.trim()) return;

    setDeletingLoading(true);
    try {
      const token = localStorage.getItem("fintech_os_auth_token");
      const res = await fetch(`${getApiBase()}/api/v1/auth/api-keys/${deletingKey.key_id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setDeletingKey(null);
        setDeleteConfirmationInput("");
        fetchKeys();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/50 backdrop-blur-md p-4 animate-in fade-in duration-200">
      
      {/* Main Big Modal Window matching AuthModal design theme */}
      <div className="w-full max-w-2xl bg-white border border-amber-200/90 rounded-2xl shadow-2xl shadow-amber-950/20 overflow-hidden flex flex-col max-h-[90vh] text-[#1E1915]">
        
        {/* Header Bar matching AuthModal */}
        <div className="bg-gradient-to-r from-amber-100/90 via-white to-orange-100/90 px-6 py-4 border-b border-amber-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-600/20 border border-white/40">
              <Key className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <h2 className="font-extrabold text-[#1E1915] text-base sm:text-lg tracking-tight flex items-center gap-2">
                <span>Developer API Keys</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900 font-extrabold uppercase border border-amber-300">
                  LIVE API
                </span>
              </h2>
              <p className="text-[11px] text-stone-500 font-medium">
                Create and manage API keys for external Python, cURL, or automated quant bots.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-amber-100/60 text-stone-500 hover:text-stone-900 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Scroll Area */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-white">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ONE-TIME API KEY DISPLAY BANNER */}
          {newlyCreatedKey && (
            <div className="p-5 bg-gradient-to-br from-amber-100/90 via-amber-50 to-orange-100/90 border-2 border-amber-400/90 rounded-2xl space-y-3 animate-in zoom-in-95 duration-200 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-950 font-black text-sm">
                  <Sparkles className="w-4 h-4 text-amber-600 fill-amber-500" />
                  <span>API Key Created: {newlyCreatedKey.name}</span>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-600 text-white font-extrabold">
                  SAVE NOW
                </span>
              </div>

              {/* Security Warning */}
              <div className="flex items-start gap-2 p-2.5 bg-amber-200/60 rounded-xl border border-amber-300 text-[11.5px] text-amber-950 font-semibold">
                <EyeOff className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Copy this secret key now!</strong> For security, this raw key will only be shown once and cannot be recovered after closing this window.
                </span>
              </div>

              {/* Raw Key Code Box */}
              <div className="flex items-center gap-2 bg-[#1E1915] text-amber-300 p-3 rounded-xl border border-amber-900/40 font-mono text-xs sm:text-sm font-bold shadow-inner overflow-x-auto">
                <span className="flex-1 select-all break-all">{newlyCreatedKey.raw_key}</span>
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                    copied
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xs"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Key</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* CREATE NEW KEY FORM */}
          <form onSubmit={handleGenerateKey} className="bg-[#FAF6F0]/90 border border-amber-200/80 p-4 rounded-2xl space-y-3">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-amber-600" />
              <span>Create New API Key</span>
            </h3>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Key / Project Name (e.g., Trading Bot Alpha)"
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-white font-medium outline-hidden text-stone-900"
              />
              <button
                type="submit"
                disabled={generating}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
              >
                <Key className="w-3.5 h-3.5" />
                <span>{generating ? "Generating..." : "Generate API Key"}</span>
              </button>
            </div>
          </form>

          {/* API KEYS LIST SECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-stone-700">
                Your API Keys ({keys.length})
              </h3>
              <span className="text-[11px] text-stone-500 font-mono">Header: X-API-Key</span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs font-semibold text-stone-400">Loading API keys...</div>
            ) : keys.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-amber-200/70 rounded-2xl bg-[#FAF6F0]/40 space-y-1">
                <Key className="w-8 h-8 text-amber-400 mx-auto" />
                <p className="text-xs font-bold text-stone-700">No API Keys Generated Yet</p>
                <p className="text-[11px] text-stone-500">Create your first API key above to start using external integrations.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {keys.map((k) => (
                  <div
                    key={k.key_id}
                    className="p-4 bg-white border border-stone-200 hover:border-amber-300 rounded-2xl transition shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-stone-900 text-xs sm:text-sm">{k.name}</span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-[11px] text-stone-500">
                        <span className="bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md text-amber-950 font-bold">{k.key_prefix}</span>
                        <span>Created: {k.created_at || "Recently"}</span>
                      </div>
                    </div>

                    {/* Corner Edit & Delete Actions */}
                    <div className="flex items-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100 justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingKey(k);
                          setEditNameInput(k.name);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-stone-200 hover:border-amber-400 hover:bg-amber-50 text-stone-700 hover:text-amber-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        title="Edit Project / Key Name"
                      >
                        <Pencil className="w-3.5 h-3.5 text-stone-500" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDeletingKey(k);
                          setDeleteConfirmationInput("");
                        }}
                        className="px-3 py-1.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        title="Delete API Key"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Bar matching AuthModal theme */}
        <div className="bg-[#FAF6F0] border-t border-amber-200/80 px-6 py-3.5 flex items-center justify-between text-xs text-stone-600 font-medium">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>SHA-256 Hashed Storage</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-200 text-stone-800 font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* EDIT KEY NAME SUB-MODAL */}
      {editingKey && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-amber-200/90 shadow-2xl p-5 space-y-4 text-[#1E1915]">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-1.5">
                <Pencil className="w-4 h-4 text-amber-600" />
                <span>Edit Key / Project Name</span>
              </h3>
              <button onClick={() => setEditingKey(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdateName} className="space-y-3">
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-stone-500 mb-1">New Name</label>
                <input
                  type="text"
                  value={editNameInput}
                  onChange={(e) => setEditNameInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:border-amber-500 outline-hidden font-medium text-stone-900"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingKey(null)}
                  className="flex-1 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-extrabold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION SAFETY SUB-MODAL */}
      {deletingKey && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-red-300 shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150 text-[#1E1915]">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-red-100 text-red-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-stone-900">Revoke & Delete API Key</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  This action is permanent. Any external scripts or applications using this key will immediately lose access.
                </p>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2">
              <p className="text-stone-700 font-semibold">
                To confirm deletion, please type the project name below:
              </p>
              <div className="bg-amber-100/70 text-amber-950 px-2.5 py-1 rounded-lg font-mono font-bold select-all border border-amber-300">
                {deletingKey.name}
              </div>
              <input
                type="text"
                value={deleteConfirmationInput}
                onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                placeholder={`Type "${deletingKey.name}" to confirm`}
                className="w-full px-3 py-2 text-xs rounded-xl border border-red-300 focus:border-red-500 outline-hidden font-mono font-medium bg-white text-stone-900"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeletingKey(null)}
                className="flex-1 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-600 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteKey}
                disabled={deleteConfirmationInput.trim() !== deletingKey.name.trim() || deletingLoading}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-extrabold shadow-xs transition"
              >
                {deletingLoading ? "Deleting..." : "Confirm Deletion"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
