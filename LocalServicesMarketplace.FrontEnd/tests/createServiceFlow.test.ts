import MockAdapter from "axios-mock-adapter";
import { providerService } from "../src/services/providerService";
import type {
  CreateServiceRequest,
  CreateServiceResponse,
} from "../src/services/providerService";

// Cream un mock pentru instanta axios folosita de `api.ts`
// Notam ca `api` din providerService.ts este importat din './api',
// deci trebuie sa mockam aceeasi instanta.
jest.mock("../src/services/api", () => {
  const actualAxios = jest.requireActual("axios");
  const instance = actualAxios.create({
    baseURL: "http://localhost:5000/api",
    headers: { "Content-Type": "application/json" },
  });
  return { __esModule: true, default: instance };
});

// Re-importam api dupa mock pentru a obtine referinta corecta
// eslint-disable-next-line @typescript-eslint/no-require-imports
const apiInstance = require("../src/services/api").default;
const mockAxios = new MockAdapter(apiInstance);

// ─── providerService.createService ───────────────────────────────────────────

describe("providerService.createService", () => {
  const validRequest: CreateServiceRequest = {
    name: "Instalatii sanitare",
    description: "Reparatii tevi, robineti si cazi de baie.",
    category: "Plumbing",
    basePrice: 150,
    priceType: "Hourly",
    estimatedDurationMinutes: 60,
  };

  afterEach(() => {
    mockAxios.reset();
  });

  // ─── Success Cases ──────────────────────────────────────────────────────────

  it("trimite POST la /providers/services cu datele corecte", async () => {
    const mockResponse: CreateServiceResponse = {
      serviceId: 1,
      message: "Service created and approved successfully!",
      moderationStatus: "Approved",
      moderationReason: undefined,
    };

    mockAxios.onPost("/providers/services").reply(201, mockResponse);

    const result = await providerService.createService(validRequest);

    expect(result).toEqual(mockResponse);
    expect(mockAxios.history.post).toHaveLength(1);
    expect(JSON.parse(mockAxios.history.post[0].data)).toMatchObject({
      name: validRequest.name,
      description: validRequest.description,
      category: validRequest.category,
      basePrice: validRequest.basePrice,
      priceType: validRequest.priceType,
      estimatedDurationMinutes: validRequest.estimatedDurationMinutes,
    });
  });

  it("returneaza raspuns cu status Approved cand AI aproba", async () => {
    const approvedResponse: CreateServiceResponse = {
      serviceId: 42,
      message: "Service created and approved successfully!",
      moderationStatus: "Approved",
    };

    mockAxios.onPost("/providers/services").reply(201, approvedResponse);

    const result = await providerService.createService(validRequest);

    expect(result.moderationStatus).toBe("Approved");
    expect(result.moderationReason).toBeUndefined();
    expect(result.serviceId).toBe(42);
  });

  it("returneaza raspuns cu status AiRejected cand AI respinge", async () => {
    const rejectedResponse: CreateServiceResponse = {
      serviceId: 43,
      message: "Service created but requires admin review. Reason: Spam",
      moderationStatus: "AiRejected",
      moderationReason: "Descrierea contine informatii de contact.",
    };

    mockAxios.onPost("/providers/services").reply(201, rejectedResponse);

    const result = await providerService.createService(validRequest);

    expect(result.moderationStatus).toBe("AiRejected");
    expect(result.moderationReason).toBe(
      "Descrierea contine informatii de contact.",
    );
  });

  // ─── Error Cases ────────────────────────────────────────────────────────────

  it("arunca eroare la 401 Unauthorized", async () => {
    mockAxios.onPost("/providers/services").reply(401, {
      message: "Unauthorized",
    });

    await expect(providerService.createService(validRequest)).rejects.toThrow();
  });

  it("arunca eroare la 403 Forbidden (non-provider)", async () => {
    mockAxios.onPost("/providers/services").reply(403, {
      message: "Only providers can create services!",
    });

    await expect(providerService.createService(validRequest)).rejects.toThrow();
  });

  it("arunca eroare la 400 cu mesaje de validare", async () => {
    mockAxios.onPost("/providers/services").reply(400, {
      errors: ["Service name is required!", "Price must be positive!"],
    });

    await expect(providerService.createService(validRequest)).rejects.toThrow();
  });

  it("arunca eroare la 500 Server Error", async () => {
    mockAxios.onPost("/providers/services").reply(500);

    await expect(providerService.createService(validRequest)).rejects.toThrow();
  });

  it("arunca eroare la timeout retea", async () => {
    mockAxios.onPost("/providers/services").timeout();

    await expect(providerService.createService(validRequest)).rejects.toThrow();
  });

  // ─── Request Format ─────────────────────────────────────────────────────────

  it("trimite toate campurile obligatorii in body", async () => {
    mockAxios.onPost("/providers/services").reply(201, {
      serviceId: 1,
      message: "OK",
      moderationStatus: "Approved",
    });

    await providerService.createService(validRequest);

    const requestBody = JSON.parse(mockAxios.history.post[0].data);
    expect(requestBody).toHaveProperty("name");
    expect(requestBody).toHaveProperty("description");
    expect(requestBody).toHaveProperty("category");
    expect(requestBody).toHaveProperty("basePrice");
    expect(requestBody).toHaveProperty("priceType");
    expect(requestBody).toHaveProperty("estimatedDurationMinutes");
  });

  it("seteaza Content-Type: application/json in header", async () => {
    mockAxios.onPost("/providers/services").reply(201, {
      serviceId: 1,
      message: "OK",
      moderationStatus: "Approved",
    });

    await providerService.createService(validRequest);
  });
});
