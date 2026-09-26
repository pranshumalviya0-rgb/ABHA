const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const getAuthToken = (): string | null => {
  return sessionStorage.getItem("clini_token") || localStorage.getItem("clini_token");
};

export const setAuthToken = (token: string, remember: boolean = true) => {
  if (remember) {
    localStorage.setItem("clini_token", token);
    sessionStorage.removeItem("clini_token");
  } else {
    sessionStorage.setItem("clini_token", token);
    localStorage.removeItem("clini_token");
  }
};

export const clearAuthToken = () => {
  localStorage.removeItem("clini_token");
  sessionStorage.removeItem("clini_token");
  localStorage.removeItem("clini_user");
  sessionStorage.removeItem("clini_user");
  sessionStorage.removeItem("target_abha_id");
};

export const setAuthUser = (user: any, remember: boolean = true) => {
  const serialized = JSON.stringify(user);
  if (remember) {
    localStorage.setItem("clini_user", serialized);
    sessionStorage.removeItem("clini_user");
  } else {
    sessionStorage.setItem("clini_user", serialized);
    localStorage.removeItem("clini_user");
  }
};

export const getAuthUser = (): any | null => {
  const raw = sessionStorage.getItem("clini_user") || localStorage.getItem("clini_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setTargetAbhaId = (abhaId: string) => {
  sessionStorage.setItem("target_abha_id", abhaId.replace(/\s+/g, ""));
};

export const getTargetAbhaId = (): string => {
  return sessionStorage.getItem("target_abha_id") || "12345678901234";
};

/**
 * Core HTTP Request Wrapper
 */
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; data?: T; error?: string; status: number }> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg =
        data.error ||
        (Array.isArray(data.details) ? data.details.join(", ") : data.details) ||
        data.message ||
        `Request failed with status ${response.status}`;
      return { ok: false, error: errorMsg, status: response.status, data };
    }

    return { ok: true, data, status: response.status };
  } catch (err: any) {
    console.error("API Network Error:", err);
    return {
      ok: false,
      error: "Unable to connect to the backend server. Please verify the server is running.",
      status: 0,
    };
  }
}

// ----------------------------------------------------------------------
// Auth API Endpoints
// ----------------------------------------------------------------------
export const authApi = {
  patientLogin: async (identifier: string, password: string) => {
    const res = await request<{
      token: string;
      patient: { id: string; abhaId: string; abhaAddress: string; fullName: string };
    }>("/auth/patient/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    });
    if (res.ok && res.data?.token) {
      setAuthToken(res.data.token, true);
      setAuthUser({ ...res.data.patient, role: "patient" }, true);
    }
    return res;
  },

  staffLogin: async (hpid: string, pin: string) => {
    const res = await request<{
      token: string;
      staff: { id: string; name: string; specialization: string };
    }>("/auth/staff/login", {
      method: "POST",
      body: JSON.stringify({ hpid, pin }),
    });
    if (res.ok && res.data?.token) {
      setAuthToken(res.data.token, false);
      setAuthUser({ ...res.data.staff, role: "staff" }, false);
    }
    return res;
  },

  facilityLogin: async (
    hfrId: string,
    staffEmployeeId: string,
    password: string,
    patientAbhaId?: string
  ) => {
    const res = await request<{
      token: string;
      facility: { id: string; facilityName: string; city: string; state: string };
      patient?: { id: string; abhaId: string; abhaAddress: string; fullName: string };
    }>("/auth/facility/login", {
      method: "POST",
      body: JSON.stringify({ hfrId, staffEmployeeId, password, patientAbhaId }),
    });
    if (res.ok && res.data?.token) {
      setAuthToken(res.data.token, false);
      setAuthUser({ ...res.data.facility, role: "facility" }, false);
      if (res.data.patient?.abhaId) {
        setTargetAbhaId(res.data.patient.abhaId);
      } else if (patientAbhaId) {
        setTargetAbhaId(patientAbhaId);
      }
    }
    return res;
  },

  forgotSendOtp: async (method: "mobile" | "abha", identifier: string) => {
    return request<{ sessionId: string; otpSentTo: string; devOtp?: string }>("/auth/patient/forgot", {
      method: "POST",
      body: JSON.stringify({ method, identifier }),
    });
  },

  forgotVerifyOtp: async (sessionId: string, otp: string) => {
    return request<{ sessionId: string; verified: boolean }>("/auth/patient/verify-otp", {
      method: "POST",
      body: JSON.stringify({ sessionId, otp }),
    });
  },

  forgotResetPassword: async (
    sessionId: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    return request<{ reset: boolean; message: string }>("/auth/patient/reset-password", {
      method: "POST",
      body: JSON.stringify({ sessionId, newPassword, confirmPassword }),
    });
  },
};

// ----------------------------------------------------------------------
// ABHA Registration API Endpoints
// ----------------------------------------------------------------------
export const abhaApi = {
  sendOtp: async (aadhaarNumber: string, mobileNumber: string, consentGiven: boolean) => {
    return request<{ registrationId: string; otpSentTo: string; devOtp?: string }>("/abha/send-otp", {
      method: "POST",
      body: JSON.stringify({ aadhaarNumber, mobileNumber, consentGiven }),
    });
  },

  verifyOtp: async (registrationId: string, otp: string) => {
    return request<{ registrationId: string; status: string }>("/abha/verify-otp", {
      method: "POST",
      body: JSON.stringify({ registrationId, otp }),
    });
  },

  checkAddress: async (handle: string) => {
    return request<{ available: boolean }>(`/abha/check-address?handle=${encodeURIComponent(handle)}`);
  },

  createAbha: async (payload: {
    registrationId: string;
    fullName: string;
    dob: string;
    gender: string;
    address: string;
    bloodGroup: string;
    abhaHandle: string;
    password?: string;
    weight_kg?: number;
    height_cm?: number;
    emergencyContact?: string;
  }) => {
    const res = await request<{
      abhaId: string;
      abhaAddress: string;
      fullName: string;
      bloodGroup: string;
      token: string;
    }>("/abha/create", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (res.ok && res.data?.token) {
      setAuthToken(res.data.token, true);
      setAuthUser(
        {
          abhaId: res.data.abhaId,
          abhaAddress: res.data.abhaAddress,
          fullName: res.data.fullName,
          role: "patient",
        },
        true
      );
    }
    return res;
  },
};

// ----------------------------------------------------------------------
// Emergency Responder API Endpoints
// ----------------------------------------------------------------------
export const emergencyApi = {
  getPatientRecord: async (abhaId: string) => {
    const cleanId = abhaId.replace(/\s+/g, "");
    return request<{
      patient: {
        abhaId: string;
        fullName: string;
        dob?: string;
        gender?: string;
        bloodGroup?: string;
        weight_kg?: number;
        height_cm?: number;
      };
      conditions: Array<{ id: string; name: string; since?: string; notes?: string }>;
      allergies: Array<{
        allergen: string;
        reactionSeverity: string;
        clinicalManifestation: string;
        epinephrineRequired: boolean;
      }>;
      medications: Array<{ genericDrug: string; route?: string; category?: string }>;
      emergencyContacts: {
        primary?: { phone: string } | null;
        secondary?: { phone: string } | null;
      };
    }>(`/emergency/patient/${cleanId}`);
  },

  notifyFamily: async (abhaId: string) => {
    const cleanId = abhaId.replace(/\s+/g, "");
    return request<{ notified: boolean; timestamp: string }>(
      `/emergency/patient/${cleanId}/notify-family`,
      {
        method: "POST",
      }
    );
  },
};

// ----------------------------------------------------------------------
// Facility & Discharge API Endpoints
// ----------------------------------------------------------------------
export const facilityApi = {
  getPatientContext: async (abhaId: string) => {
    const cleanId = abhaId.replace(/\s+/g, "");
    return request<{ patient: { abhaId: string; fullName: string } }>(
      `/facility/patient/${cleanId}`
    );
  },
};

export const dischargeApi = {
  submitDischarge: async (payload: {
    patientAbhaId: string;
    allergy?: any;
    diabetes?: any;
    implant?: any;
    bloodThinner?: any;
    highRiskMed?: any;
    doctorNote?: string;
    admittedAt?: string;
  }) => {
    return request<{ dischargeId: string; submittedAt: string }>("/discharge", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

// ----------------------------------------------------------------------
// Patient Dashboard API Endpoints
// ----------------------------------------------------------------------
export const patientApi = {
  getProfile: async () => {
    return request<{
      patient: {
        abhaId: string;
        abhaAddress: string;
        fullName: string;
        bloodGroup: string;
        primaryContact?: string;
        secondaryContact?: string;
        cardRequested?: boolean;
      };
      conditions: Array<{ id: string; name: string; since?: string; notes?: string }>;
    }>("/patient/me");
  },

  getAuditLogs: async (page = 1, limit = 20) => {
    return request<{
      total: number;
      page: number;
      logs: Array<{
        id: string;
        facilityName: string;
        actorName: string;
        dataAccessed: string;
        tone: "emergency" | "warn" | "ok";
        createdAt: string;
      }>;
    }>(`/patient/me/audit-log?page=${page}&limit=${limit}`);
  },

  addCondition: async (condition: { name: string; since?: string; notes?: string }) => {
    return request<{
      condition: { id: string; name: string; since?: string; notes?: string };
    }>("/patient/me/conditions", {
      method: "POST",
      body: JSON.stringify(condition),
    });
  },

  removeCondition: async (conditionId: string) => {
    return request<{ deleted: boolean }>(`/patient/me/conditions/${conditionId}`, {
      method: "DELETE",
    });
  },

  updateEmergencyContacts: async (primaryContact: string, secondaryContact: string) => {
    return request<{ primaryContact?: string; secondaryContact?: string }>(
      "/patient/me/emergency-contacts",
      {
        method: "PUT",
        body: JSON.stringify({ primaryContact, secondaryContact }),
      }
    );
  },

  requestCard: async () => {
    return request<{ cardRequested: boolean; cardRequestedAt: string }>(
      "/patient/me/request-card",
      {
        method: "POST",
      }
    );
  },
};
