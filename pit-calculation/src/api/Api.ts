/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export enum RoleRole {
  User = 0,
  Moderator = 1,
  Guest = 2,
}

export interface HandlerErrorResponse {
  message?: string;
}

export interface ModelLoginRequest {
  password: string;
  username: string;
}

export interface ModelLoginResp {
  access_token?: string;
  expires_in?: number;
  role?: number;
  token_type?: string;
  user_id?: number;
  username?: string;
}

export interface ModelMaterial {
  coefficient?: number;
  description?: string;
  id?: number;
  image_url?: string;
  is_deleted?: boolean;
  title?: string;
}

export interface ModelMaterialWithCalculationData {
  coefficient?: number;
  description?: string;
  id?: number;
  image_url?: string;
  is_deleted?: boolean;
  slope_angle?: number;
  title?: string;
  volume_result?: number;
}

export interface ModelPitsCalculationListItem {
  calculated_materials_count?: number;
  completed_at?: string;
  created_at?: string;
  creator_id?: number;
  formed_at?: string;
  id?: number;
  moderator_id?: number;
  pit_depth?: number;
  pit_length?: number;
  pit_width?: number;
  status?: string;
}

export interface ModelPitsCalculationWithMaterials {
  completed_at?: string;
  created_at?: string;
  creator_id?: number;
  formed_at?: string;
  id?: number;
  materials?: ModelMaterialWithCalculationData[];
  moderator_id?: number;
  pit_depth?: number;
  pit_length?: number;
  pit_width?: number;
  status?: string;
}

export interface ModelRegisterRequest {
  password: string;
  role?: number;
  username: string;
}

export interface ModelUpdatePitParam {
  pit_depth?: number;
  pit_length?: number;
  pit_width?: number;
}

export interface ModelUpdateProfileRequest {
  password: string;
  username: string;
}

export interface ModelUsers {
  id?: number;
  role?: RoleRole;
  username?: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "http://localhost:8080/api",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title DIA API
 * @version 1.0
 * @baseUrl http://localhost:8080/api
 * @contact
 *
 * API для расчета земляных работ при разработке котлована
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  calculationMaterials = {
    /**
     * @description Обновление угла откоса материала в заявке расчета (только владелец заявки)
     *
     * @tags calculation-materials
     * @name CalculationMaterialsUpdate
     * @summary Обновление материала в заявке
     * @request PUT:/calculation-materials/{calculation_id}/{material_id}
     * @secure
     */
    calculationMaterialsUpdate: (
      calculationId: number,
      materialId: number,
      input: object,
      params: RequestParams = {},
    ) =>
      this.request<void, HandlerErrorResponse>({
        path: `/calculation-materials/${calculationId}/${materialId}`,
        method: "PUT",
        body: input,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Удаление материала из заявки расчета (только владелец заявки)
     *
     * @tags calculation-materials
     * @name CalculationMaterialsDelete
     * @summary Удаление материала из заявки
     * @request DELETE:/calculation-materials/{calculation_id}/{material_id}
     * @secure
     */
    calculationMaterialsDelete: (
      calculationId: number,
      materialId: number,
      params: RequestParams = {},
    ) =>
      this.request<void, HandlerErrorResponse>({
        path: `/calculation-materials/${calculationId}/${materialId}`,
        method: "DELETE",
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  materials = {
    /**
     * @description Получение списка всех материалов с возможностью фильтрации по названию
     *
     * @tags materials
     * @name MaterialsList
     * @summary Получение списка материалов
     * @request GET:/materials
     */
    materialsList: (
      query?: {
        /** Фильтр по названию материала */
        materialTitle?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ModelMaterial[], HandlerErrorResponse>({
        path: `/materials`,
        method: "GET",
        query: query,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Создание материала (только для модераторов)
     *
     * @tags materials
     * @name MaterialsCreate
     * @summary Создание нового материала
     * @request POST:/materials
     * @secure
     */
    materialsCreate: (input: ModelMaterial, params: RequestParams = {}) =>
      this.request<ModelMaterial, HandlerErrorResponse>({
        path: `/materials`,
        method: "POST",
        body: input,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Получение информации о конкретном материале
     *
     * @tags materials
     * @name MaterialsDetail
     * @summary Получение материала по ID
     * @request GET:/materials/{id}
     */
    materialsDetail: (id: number, params: RequestParams = {}) =>
      this.request<ModelMaterial, HandlerErrorResponse>({
        path: `/materials/${id}`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Обновление информации о материале (только для модераторов)
     *
     * @tags materials
     * @name MaterialsUpdate
     * @summary Обновление материала
     * @request PUT:/materials/{id}
     * @secure
     */
    materialsUpdate: (
      id: number,
      input: ModelMaterial,
      params: RequestParams = {},
    ) =>
      this.request<ModelMaterial, HandlerErrorResponse>({
        path: `/materials/${id}`,
        method: "PUT",
        body: input,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Удаление материала (только для модераторов)
     *
     * @tags materials
     * @name MaterialsDelete
     * @summary Удаление материала
     * @request DELETE:/materials/{id}
     * @secure
     */
    materialsDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, HandlerErrorResponse>({
        path: `/materials/${id}`,
        method: "DELETE",
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Загрузка изображения для материала (только для модераторов)
     *
     * @tags materials
     * @name ImageCreate
     * @summary Загрузка изображения материала
     * @request POST:/materials/{id}/image
     * @secure
     */
    imageCreate: (
      id: number,
      data: {
        /** Изображение материала */
        image: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, HandlerErrorResponse>({
        path: `/materials/${id}/image`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        ...params,
      }),

    /**
     * @description Добавление материала в текущую заявку пользователя
     *
     * @tags materials
     * @name PostMaterials
     * @summary Добавление материала в заявку
     * @request POST:/materials/{id}/pit
     * @secure
     */
    postMaterials: (id: number, params: RequestParams = {}) =>
      this.request<void, HandlerErrorResponse>({
        path: `/materials/${id}/pit`,
        method: "POST",
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  pits = {
    /**
     * @description Получение списка всех заявок с фильтрацией (только для модераторов)
     *
     * @tags pits
     * @name PitsList
     * @summary Получение списка заявок
     * @request GET:/pits
     * @secure
     */
    pitsList: (
      query?: {
        /** Фильтр по статусу */
        status?: string;
        /** Начальная дата (формат: YYYY-MM-DD) */
        start_date?: string;
        /** Конечная дата (формат: YYYY-MM-DD) */
        end_date?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ModelPitsCalculationListItem[], HandlerErrorResponse>({
        path: `/pits`,
        method: "GET",
        query: query,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Получение ID черновика заявки пользователя и количества материалов в ней. Для гостей возвращает -1.
     *
     * @tags pits
     * @name DraftList
     * @summary Получение черновика заявки
     * @request GET:/pits/draft
     * @secure
     */
    draftList: (params: RequestParams = {}) =>
      this.request<object, HandlerErrorResponse>({
        path: `/pits/draft`,
        method: "GET",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Получение детальной информации о заявке включая материалы
     *
     * @tags pits
     * @name PitsDetail
     * @summary Получение заявки с материалами
     * @request GET:/pits/{id}
     * @secure
     */
    pitsDetail: (id: number, params: RequestParams = {}) =>
      this.request<ModelPitsCalculationWithMaterials, HandlerErrorResponse>({
        path: `/pits/${id}`,
        method: "GET",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Обновление данных заявки (только владелец заявки)
     *
     * @tags pits
     * @name PitsUpdate
     * @summary Обновление заявки
     * @request PUT:/pits/{id}
     * @secure
     */
    pitsUpdate: (
      id: number,
      input: ModelUpdatePitParam,
      params: RequestParams = {},
    ) =>
      this.request<void, HandlerErrorResponse>({
        path: `/pits/${id}`,
        method: "PUT",
        body: input,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Удаление заявки (только для черновиков и только владелец заявки или модератор)
     *
     * @tags pits
     * @name PitsDelete
     * @summary Удаление заявки
     * @request DELETE:/pits/{id}
     * @secure
     */
    pitsDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, HandlerErrorResponse>({
        path: `/pits/${id}`,
        method: "DELETE",
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Перевод заявки в статус "completed" или "rejected" (только для модераторов)
     *
     * @tags pits
     * @name CompleteUpdate
     * @summary Завершение/отклонение заявки
     * @request PUT:/pits/{id}/complete
     * @secure
     */
    completeUpdate: (id: number, input: string, params: RequestParams = {}) =>
      this.request<void, HandlerErrorResponse>({
        path: `/pits/${id}/complete`,
        method: "PUT",
        body: input,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Перевод заявки из черновика в статус "formed" (только владелец заявки)
     *
     * @tags pits
     * @name FormUpdate
     * @summary Формирование заявки
     * @request PUT:/pits/{id}/form
     * @secure
     */
    formUpdate: (id: number, params: RequestParams = {}) =>
      this.request<void, HandlerErrorResponse>({
        path: `/pits/${id}/form`,
        method: "PUT",
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  users = {
    /**
     * @description Создание нового пользователя
     *
     * @tags users
     * @name UsersCreate
     * @summary Регистрация пользователя
     * @request POST:/users
     */
    usersCreate: (input: ModelRegisterRequest, params: RequestParams = {}) =>
      this.request<ModelUsers, HandlerErrorResponse>({
        path: `/users`,
        method: "POST",
        body: input,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Вход в систему и получение JWT токена
     *
     * @tags users
     * @name LoginCreate
     * @summary Авторизация пользователя
     * @request POST:/users/login
     */
    loginCreate: (input: ModelLoginRequest, params: RequestParams = {}) =>
      this.request<ModelLoginResp, HandlerErrorResponse>({
        path: `/users/login`,
        method: "POST",
        body: input,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Выход пользователя и добавление токена в blacklist
     *
     * @tags users
     * @name LogoutCreate
     * @summary Выход из системы
     * @request POST:/users/logout
     * @secure
     */
    logoutCreate: (params: RequestParams = {}) =>
      this.request<Record<string, string>, HandlerErrorResponse>({
        path: `/users/logout`,
        method: "POST",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Получение информации о пользователе по ID
     *
     * @tags users
     * @name UsersDetail
     * @summary Получение профиля пользователя
     * @request GET:/users/{id}
     * @secure
     */
    usersDetail: (id: number, params: RequestParams = {}) =>
      this.request<ModelUsers, HandlerErrorResponse>({
        path: `/users/${id}`,
        method: "GET",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Обновление данных пользователя
     *
     * @tags users
     * @name UsersUpdate
     * @summary Обновление профиля пользователя
     * @request PUT:/users/{id}
     * @secure
     */
    usersUpdate: (
      id: number,
      input: ModelUpdateProfileRequest,
      params: RequestParams = {},
    ) =>
      this.request<ModelUsers, HandlerErrorResponse>({
        path: `/users/${id}`,
        method: "PUT",
        body: input,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
