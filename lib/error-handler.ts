import { ApiError, ApiErrorResponse, ErrorContext, ErrorType } from "./types";

// Parse error response from API
export const parseApiError = async (response: Response): Promise<ApiError> => {
  let errorData: ApiErrorResponse = {};

  try {
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      errorData = await response.json();
    } else {
      const text = await response.text();
      errorData = { message: text || response.statusText };
    }
  } catch {
    errorData = { message: response.statusText };
  }

  const message =
    errorData.message || errorData.error || `HTTP ${response.status}`;
  return new ApiError(message, response.status, errorData.details);
};

// Classify and format error for user display
export const handleError = (error: unknown): ErrorContext => {
  // Network errors
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return {
      type: ErrorType.NETWORK,
      message: "Network connection failed",
      userMessage: "Erro de conexão. Verifique sua internet e tente novamente.",
    };
  }

  // API errors with status codes
  if (error instanceof ApiError) {
    switch (error.statusCode) {
      case 400:
        return {
          type: ErrorType.VALIDATION,
          message: error.message,
          userMessage: `Erro de validação: ${error.message}`,
        };
      case 401:
        return {
          type: ErrorType.VALIDATION,
          message: "Unauthorized",
          userMessage: "Acesso não autorizado. Verifique suas credenciais.",
        };
      case 404:
        return {
          type: ErrorType.SERVER,
          message: "Endpoint not found",
          userMessage:
            "Serviço não encontrado. Entre em contato com o suporte.",
        };
      case 422:
        return {
          type: ErrorType.VALIDATION,
          message: error.message,
          userMessage: `Dados inválidos: ${error.message}`,
        };
      case 500:
      case 502:
      case 503:
        return {
          type: ErrorType.SERVER,
          message: error.message,
          userMessage: "Erro no servidor. Tente novamente em alguns instantes.",
        };
      case 504:
        return {
          type: ErrorType.TIMEOUT,
          message: "Gateway timeout",
          userMessage: "Tempo de resposta excedido. Tente novamente.",
        };
      default:
        return {
          type: ErrorType.SERVER,
          message: error.message,
          userMessage: `Erro ${error.statusCode}: ${error.message}`,
        };
    }
  }

  // Generic errors
  if (error instanceof Error) {
    return {
      type: ErrorType.UNKNOWN,
      message: error.message,
      userMessage: `Erro: ${error.message}`,
    };
  }

  // Unknown error type
  return {
    type: ErrorType.UNKNOWN,
    message: "Unknown error occurred",
    userMessage: "Erro desconhecido. Por favor, tente novamente.",
  };
};

// Utility function to handle notifications with auto-dismiss
export const showNotification = (
  setter: (value: string | null) => void,
  message: string,
  timeout: number
) => {
  setter(message);
  setTimeout(() => setter(null), timeout);
};
