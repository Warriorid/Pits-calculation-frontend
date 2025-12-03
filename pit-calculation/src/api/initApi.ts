import { Api } from './Api';

export const api = (token?: string): Api<string> => {
  const formatToken = (rawToken?: string): string | undefined => {
    if (!rawToken) return undefined;
    
    if (rawToken.startsWith('Bearer ')) {
      return rawToken.replace('Bearer ', '');
    }
    return rawToken;
  };

  const formattedToken = formatToken(token);
  
  const apiInstance = new Api<string>({
    ...(formattedToken ? {
      securityWorker: (securityData) => {
        if (securityData) {
          return {
            headers: {
              Authorization: `Bearer ${securityData}`,
            },
          };
        }
      },
      secure: true
    } : {})
  });
  if (formattedToken) {
    apiInstance.setSecurityData(formattedToken);
  }

  return apiInstance;
};

let apiInstance: Api<string> | null = null;

export const getApiInstance = (token?: string): Api<string> => {
  const formatToken = (rawToken?: string): string | undefined => {
    if (!rawToken) return undefined;
    
    if (rawToken.startsWith('Bearer ')) {
      return rawToken.replace('Bearer ', '');
    }
    return rawToken;
  };

  const formattedToken = formatToken(token);
  
  if (!apiInstance) {
    apiInstance = new Api<string>({
      ...(formattedToken ? {
        securityWorker: (securityData) => {
          if (securityData) {
            return {
              headers: {
                Authorization: `Bearer ${securityData}`,
              },
            };
          }
        },
        secure: true
      } : {})
    });
  }

  if (formattedToken) {
    apiInstance.setSecurityData(formattedToken);
  }

  return apiInstance;
};