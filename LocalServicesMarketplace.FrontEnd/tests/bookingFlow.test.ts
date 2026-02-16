import MockAdapter from "axios-mock-adapter";
import { bookingService } from "../src/services/bookingService";
import type {
  CreateBookingRequest,
  CreateBookingResponse,
  GetMyBookingsResponse,
  BookingDto,
  UpdateBookingStatusRequest,
  UpdateBookingStatusResponse,
  CancelBookingResponse,
  ProviderAvailabilityResponse,
} from "../src/services/bookingService";

// Mock instanta axios folosita de `api.ts`
jest.mock("../src/services/api", () => {
  const actualAxios = jest.requireActual("axios");
  const instance = actualAxios.create({
    baseURL: "http://localhost:5000/api",
    headers: { "Content-Type": "application/json" },
  });
  return { __esModule: true, default: instance };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const apiInstance = require("../src/services/api").default;
const mockAxios = new MockAdapter(apiInstance);

// ─── bookingService.create ───────────────────────────────────────────────────

describe("bookingService.create", () => {
  const validRequest: CreateBookingRequest = {
    providerId: "provider-123",
    serviceId: 1,
    scheduledDate: "2026-03-01",
    scheduledTime: "10:00",
    address: "Str. Mihai Eminescu 42",
    city: "Bucuresti",
    postalCode: "010010",
    customerNotes: "Va rog sa sunati inainte.",
  };

  afterEach(() => {
    mockAxios.reset();
  });

  it("trimite POST la /bookings cu datele corecte", async () => {
    const mockResponse: CreateBookingResponse = {
      bookingId: 100,
      message: "Booking created successfully!",
    };

    mockAxios.onPost("/bookings").reply(201, mockResponse);

    const result = await bookingService.create(validRequest);

    expect(result).toEqual(mockResponse);
    expect(mockAxios.history.post).toHaveLength(1);

    const sentBody = JSON.parse(mockAxios.history.post[0].data);
    expect(sentBody).toMatchObject({
      providerId: "provider-123",
      serviceId: 1,
      scheduledDate: "2026-03-01",
      scheduledTime: "10:00",
    });
  });

  it("trimite campurile optionale (address, city, notes) in body", async () => {
    mockAxios.onPost("/bookings").reply(201, {
      bookingId: 101,
      message: "OK",
    });

    await bookingService.create(validRequest);

    const sentBody = JSON.parse(mockAxios.history.post[0].data);
    expect(sentBody).toHaveProperty("address", "Str. Mihai Eminescu 42");
    expect(sentBody).toHaveProperty("city", "Bucuresti");
    expect(sentBody).toHaveProperty("postalCode", "010010");
    expect(sentBody).toHaveProperty(
      "customerNotes",
      "Va rog sa sunati inainte.",
    );
  });

  it("functioneaza fara campuri optionale", async () => {
    const minimalRequest: CreateBookingRequest = {
      providerId: "provider-456",
      serviceId: 2,
      scheduledDate: "2026-04-15",
      scheduledTime: "14:00",
    };

    mockAxios.onPost("/bookings").reply(201, {
      bookingId: 102,
      message: "OK",
    });

    const result = await bookingService.create(minimalRequest);

    expect(result.bookingId).toBe(102);
  });

  it("arunca eroare la 401 Unauthorized", async () => {
    mockAxios.onPost("/bookings").reply(401, { message: "Unauthorized" });

    await expect(bookingService.create(validRequest)).rejects.toThrow();
  });

  it("arunca eroare la 400 cu mesaje de validare", async () => {
    mockAxios.onPost("/bookings").reply(400, {
      errors: [
        "ScheduledDate must be in the future!",
        "ServiceId is required!",
      ],
    });

    await expect(bookingService.create(validRequest)).rejects.toThrow();
  });

  it("arunca eroare la 404 cand provider-ul nu exista", async () => {
    mockAxios.onPost("/bookings").reply(404, {
      message: "Provider not found",
    });

    await expect(bookingService.create(validRequest)).rejects.toThrow();
  });

  it("arunca eroare la 409 cand slot-ul este deja ocupat", async () => {
    mockAxios.onPost("/bookings").reply(409, {
      message: "Time slot is no longer available",
    });

    await expect(bookingService.create(validRequest)).rejects.toThrow();
  });

  it("arunca eroare la 500 Server Error", async () => {
    mockAxios.onPost("/bookings").reply(500);

    await expect(bookingService.create(validRequest)).rejects.toThrow();
  });

  it("arunca eroare la timeout retea", async () => {
    mockAxios.onPost("/bookings").timeout();

    await expect(bookingService.create(validRequest)).rejects.toThrow();
  });
});

// ─── bookingService.getMyBookings ────────────────────────────────────────────

describe("bookingService.getMyBookings", () => {
  afterEach(() => {
    mockAxios.reset();
  });

  const mockBookingsResponse: GetMyBookingsResponse = {
    bookings: [
      {
        id: 1,
        providerName: "Ion Popescu",
        providerBusinessName: "Instalatii Ion",
        providerId: "provider-123",
        customerName: "Maria Ionescu",
        serviceName: "Reparatii tevi",
        serviceCategory: "Plumbing",
        scheduledDate: "2026-03-01",
        scheduledTime: "10:00",
        city: "Bucuresti",
        quotedPrice: 150,
        priceType: "Hourly",
        status: "Pending",
        createdAt: "2026-02-15T10:00:00Z",
        canReview: false,
      },
      {
        id: 2,
        providerName: "Andrei Popa",
        providerBusinessName: "ElectroPro",
        providerId: "provider-456",
        customerName: "Maria Ionescu",
        serviceName: "Montaj prize",
        serviceCategory: "Electrical",
        scheduledDate: "2026-03-05",
        scheduledTime: "14:00",
        city: "Cluj-Napoca",
        quotedPrice: 200,
        priceType: "Fixed",
        status: "Completed",
        createdAt: "2026-02-10T08:00:00Z",
        canReview: true,
      },
    ],
    totalCount: 2,
    totalPages: 1,
    currentPage: 1,
    stats: {
      pending: 1,
      confirmed: 0,
      inProgress: 0,
      completed: 1,
      cancelled: 0,
      total: 2,
    },
  };

  it("trimite GET la /bookings/my fara parametri", async () => {
    mockAxios.onGet("/bookings/my").reply(200, mockBookingsResponse);

    const result = await bookingService.getMyBookings();

    expect(result).toEqual(mockBookingsResponse);
    expect(mockAxios.history.get).toHaveLength(1);
  });

  it("returneaza lista de bookings cu stats", async () => {
    mockAxios.onGet("/bookings/my").reply(200, mockBookingsResponse);

    const result = await bookingService.getMyBookings();

    expect(result.bookings).toHaveLength(2);
    expect(result.stats.total).toBe(2);
    expect(result.stats.pending).toBe(1);
    expect(result.stats.completed).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("trimite parametrul status ca query param", async () => {
    mockAxios.onGet("/bookings/my").reply(200, {
      ...mockBookingsResponse,
      bookings: [mockBookingsResponse.bookings[0]],
      totalCount: 1,
    });

    await bookingService.getMyBookings({ status: "Pending" });

    expect(mockAxios.history.get[0].params).toMatchObject({
      status: "Pending",
    });
  });

  it("trimite parametrul role ca query param", async () => {
    mockAxios.onGet("/bookings/my").reply(200, mockBookingsResponse);

    await bookingService.getMyBookings({ role: "provider" });

    expect(mockAxios.history.get[0].params).toMatchObject({
      role: "provider",
    });
  });

  it("trimite parametrii de paginare", async () => {
    mockAxios.onGet("/bookings/my").reply(200, mockBookingsResponse);

    await bookingService.getMyBookings({ page: 2, pageSize: 5 });

    expect(mockAxios.history.get[0].params).toMatchObject({
      page: 2,
      pageSize: 5,
    });
  });

  it("trimite parametrii de filtrare dupa data", async () => {
    mockAxios.onGet("/bookings/my").reply(200, mockBookingsResponse);

    await bookingService.getMyBookings({
      fromDate: "2026-01-01",
      toDate: "2026-12-31",
    });

    expect(mockAxios.history.get[0].params).toMatchObject({
      fromDate: "2026-01-01",
      toDate: "2026-12-31",
    });
  });

  it("trimite parametrul sortBy", async () => {
    mockAxios.onGet("/bookings/my").reply(200, mockBookingsResponse);

    await bookingService.getMyBookings({ sortBy: "newest" });

    expect(mockAxios.history.get[0].params).toMatchObject({
      sortBy: "newest",
    });
  });

  it("combina mai multi parametri de filtrare", async () => {
    mockAxios.onGet("/bookings/my").reply(200, mockBookingsResponse);

    await bookingService.getMyBookings({
      status: "Completed",
      role: "customer",
      page: 1,
      pageSize: 10,
      sortBy: "oldest",
    });

    expect(mockAxios.history.get[0].params).toMatchObject({
      status: "Completed",
      role: "customer",
      page: 1,
      pageSize: 10,
      sortBy: "oldest",
    });
  });

  it("arunca eroare la 401 Unauthorized", async () => {
    mockAxios.onGet("/bookings/my").reply(401);

    await expect(bookingService.getMyBookings()).rejects.toThrow();
  });

  it("arunca eroare la 500 Server Error", async () => {
    mockAxios.onGet("/bookings/my").reply(500);

    await expect(bookingService.getMyBookings()).rejects.toThrow();
  });
});

// ─── bookingService.getById ──────────────────────────────────────────────────

describe("bookingService.getById", () => {
  afterEach(() => {
    mockAxios.reset();
  });

  const mockBooking: BookingDto = {
    id: 1,
    customerId: "customer-001",
    customerName: "Maria Ionescu",
    customerPhone: "0722123456",
    providerId: "provider-123",
    providerName: "Ion Popescu",
    providerBusinessName: "Instalatii Ion",
    providerPhone: "0733654321",
    serviceId: 10,
    serviceName: "Reparatii tevi",
    serviceCategory: "Plumbing",
    scheduledDate: "2026-03-01",
    scheduledTime: "10:00",
    estimatedDurationMinutes: 60,
    address: "Str. Mihai Eminescu 42",
    city: "Bucuresti",
    postalCode: "010010",
    customerNotes: "Va rog sa sunati inainte.",
    quotedPrice: 150,
    priceType: "Hourly",
    status: "Confirmed",
    createdAt: "2026-02-15T10:00:00Z",
    confirmedAt: "2026-02-15T12:00:00Z",
    customerHasReviewed: false,
    canReview: false,
  };

  it("trimite GET la /bookings/:id", async () => {
    mockAxios.onGet("/bookings/1").reply(200, mockBooking);

    const result = await bookingService.getById(1);

    expect(result).toEqual(mockBooking);
    expect(mockAxios.history.get).toHaveLength(1);
  });

  it("returneaza toate campurile booking-ului", async () => {
    mockAxios.onGet("/bookings/1").reply(200, mockBooking);

    const result = await bookingService.getById(1);

    expect(result.id).toBe(1);
    expect(result.customerId).toBe("customer-001");
    expect(result.providerId).toBe("provider-123");
    expect(result.status).toBe("Confirmed");
    expect(result.estimatedDurationMinutes).toBe(60);
    expect(result.customerHasReviewed).toBe(false);
  });

  it("arunca eroare la 404 cand booking-ul nu exista", async () => {
    mockAxios.onGet("/bookings/999").reply(404, {
      message: "Booking not found",
    });

    await expect(bookingService.getById(999)).rejects.toThrow();
  });

  it("arunca eroare la 403 cand user-ul nu are acces", async () => {
    mockAxios.onGet("/bookings/1").reply(403, {
      message: "You do not have access to this booking",
    });

    await expect(bookingService.getById(1)).rejects.toThrow();
  });

  it("arunca eroare la 401 Unauthorized", async () => {
    mockAxios.onGet("/bookings/1").reply(401);

    await expect(bookingService.getById(1)).rejects.toThrow();
  });
});

// ─── bookingService.updateStatus ─────────────────────────────────────────────

describe("bookingService.updateStatus", () => {
  afterEach(() => {
    mockAxios.reset();
  });

  it("trimite PUT la /bookings/:id/status cu status Confirmed", async () => {
    const request: UpdateBookingStatusRequest = {
      newStatus: "Confirmed",
    };

    const mockResponse: UpdateBookingStatusResponse = {
      bookingId: 1,
      status: "Confirmed",
      message: "Booking confirmed!",
    };

    mockAxios.onPut("/bookings/1/status").reply(200, mockResponse);

    const result = await bookingService.updateStatus(1, request);

    expect(result).toEqual(mockResponse);
    expect(JSON.parse(mockAxios.history.put[0].data)).toMatchObject({
      newStatus: "Confirmed",
    });
  });

  it("permite tranzitia Confirmed -> InProgress", async () => {
    const request: UpdateBookingStatusRequest = {
      newStatus: "InProgress",
    };

    mockAxios.onPut("/bookings/1/status").reply(200, {
      bookingId: 1,
      status: "InProgress",
      message: "Booking is now in progress!",
    });

    const result = await bookingService.updateStatus(1, request);

    expect(result.status).toBe("InProgress");
  });

  it("permite tranzitia InProgress -> Completed cu finalPrice si note", async () => {
    const request: UpdateBookingStatusRequest = {
      newStatus: "Completed",
      finalPrice: 180,
      providerNotes: "Am inlocuit doua tevi.",
    };

    mockAxios.onPut("/bookings/1/status").reply(200, {
      bookingId: 1,
      status: "Completed",
      message: "Booking completed!",
    });

    const result = await bookingService.updateStatus(1, request);

    expect(result.status).toBe("Completed");

    const sentBody = JSON.parse(mockAxios.history.put[0].data);
    expect(sentBody.finalPrice).toBe(180);
    expect(sentBody.providerNotes).toBe("Am inlocuit doua tevi.");
  });

  it("permite setarea statusului Rejected", async () => {
    const request: UpdateBookingStatusRequest = {
      newStatus: "Rejected",
      providerNotes: "Nu sunt disponibil in aceasta perioada.",
    };

    mockAxios.onPut("/bookings/1/status").reply(200, {
      bookingId: 1,
      status: "Rejected",
      message: "Booking rejected.",
    });

    const result = await bookingService.updateStatus(1, request);

    expect(result.status).toBe("Rejected");
  });

  it("permite setarea statusului NoShow", async () => {
    const request: UpdateBookingStatusRequest = {
      newStatus: "NoShow",
    };

    mockAxios.onPut("/bookings/1/status").reply(200, {
      bookingId: 1,
      status: "NoShow",
      message: "Marked as no-show.",
    });

    const result = await bookingService.updateStatus(1, request);

    expect(result.status).toBe("NoShow");
  });

  it("arunca eroare la 400 pentru tranzitie invalida de status", async () => {
    mockAxios.onPut("/bookings/1/status").reply(400, {
      message: "Invalid status transition",
    });

    await expect(
      bookingService.updateStatus(1, { newStatus: "Completed" }),
    ).rejects.toThrow();
  });

  it("arunca eroare la 403 cand nu esti provider-ul booking-ului", async () => {
    mockAxios.onPut("/bookings/1/status").reply(403, {
      message: "Only the assigned provider can update status",
    });

    await expect(
      bookingService.updateStatus(1, { newStatus: "Confirmed" }),
    ).rejects.toThrow();
  });

  it("arunca eroare la 404 cand booking-ul nu exista", async () => {
    mockAxios.onPut("/bookings/999/status").reply(404);

    await expect(
      bookingService.updateStatus(999, { newStatus: "Confirmed" }),
    ).rejects.toThrow();
  });

  it("arunca eroare la 500 Server Error", async () => {
    mockAxios.onPut("/bookings/1/status").reply(500);

    await expect(
      bookingService.updateStatus(1, { newStatus: "InProgress" }),
    ).rejects.toThrow();
  });
});

// ─── bookingService.cancel ───────────────────────────────────────────────────

describe("bookingService.cancel", () => {
  afterEach(() => {
    mockAxios.reset();
  });

  it("trimite POST la /bookings/:id/cancel cu motiv de anulare", async () => {
    const mockResponse: CancelBookingResponse = {
      bookingId: 1,
      message: "Booking cancelled successfully!",
    };

    mockAxios.onPost("/bookings/1/cancel").reply(200, mockResponse);

    const result = await bookingService.cancel(1, {
      cancellationReason: "Am gasit alt provider.",
    });

    expect(result).toEqual(mockResponse);
    expect(JSON.parse(mockAxios.history.post[0].data)).toMatchObject({
      cancellationReason: "Am gasit alt provider.",
    });
  });

  it("functioneaza fara motiv de anulare", async () => {
    mockAxios.onPost("/bookings/1/cancel").reply(200, {
      bookingId: 1,
      message: "Booking cancelled!",
    });

    const result = await bookingService.cancel(1);

    expect(result.bookingId).toBe(1);
    // Trimite un body gol {} cand nu are cancellationReason
    expect(JSON.parse(mockAxios.history.post[0].data)).toEqual({});
  });

  it("arunca eroare la 400 cand booking-ul nu poate fi anulat", async () => {
    mockAxios.onPost("/bookings/1/cancel").reply(400, {
      message: "Cannot cancel a completed booking",
    });

    await expect(bookingService.cancel(1)).rejects.toThrow();
  });

  it("arunca eroare la 403 cand nu esti parte din booking", async () => {
    mockAxios.onPost("/bookings/1/cancel").reply(403, {
      message: "You are not part of this booking",
    });

    await expect(bookingService.cancel(1)).rejects.toThrow();
  });

  it("arunca eroare la 404 cand booking-ul nu exista", async () => {
    mockAxios.onPost("/bookings/999/cancel").reply(404);

    await expect(bookingService.cancel(999)).rejects.toThrow();
  });

  it("arunca eroare la 500 Server Error", async () => {
    mockAxios.onPost("/bookings/1/cancel").reply(500);

    await expect(bookingService.cancel(1)).rejects.toThrow();
  });
});

// ─── bookingService.getProviderAvailability ──────────────────────────────────

describe("bookingService.getProviderAvailability", () => {
  afterEach(() => {
    mockAxios.reset();
  });

  const mockAvailability: ProviderAvailabilityResponse = {
    providerId: "provider-123",
    date: "2026-03-01",
    availableSlots: [
      { startTime: "08:00", endTime: "09:00", isAvailable: true },
      { startTime: "09:00", endTime: "10:00", isAvailable: true },
      { startTime: "11:00", endTime: "12:00", isAvailable: true },
    ],
    bookedSlots: [
      {
        startTime: "10:00",
        endTime: "11:00",
        isAvailable: false,
        bookingId: 50,
      },
    ],
  };

  it("trimite GET la /bookings/availability/:providerId cu data", async () => {
    mockAxios
      .onGet("/bookings/availability/provider-123")
      .reply(200, mockAvailability);

    const result = await bookingService.getProviderAvailability(
      "provider-123",
      "2026-03-01",
    );

    expect(result).toEqual(mockAvailability);
    expect(mockAxios.history.get).toHaveLength(1);
    expect(mockAxios.history.get[0].params).toMatchObject({
      date: "2026-03-01",
    });
  });

  it("returneaza sloturi disponibile si ocupate", async () => {
    mockAxios
      .onGet("/bookings/availability/provider-123")
      .reply(200, mockAvailability);

    const result = await bookingService.getProviderAvailability(
      "provider-123",
      "2026-03-01",
    );

    expect(result.availableSlots).toHaveLength(3);
    expect(result.bookedSlots).toHaveLength(1);
    expect(result.availableSlots[0].isAvailable).toBe(true);
    expect(result.bookedSlots[0].isAvailable).toBe(false);
    expect(result.bookedSlots[0].bookingId).toBe(50);
  });

  it("returneaza lista goala cand provider-ul nu are sloturi", async () => {
    const emptyAvailability: ProviderAvailabilityResponse = {
      providerId: "provider-789",
      date: "2026-03-01",
      availableSlots: [],
      bookedSlots: [],
    };

    mockAxios
      .onGet("/bookings/availability/provider-789")
      .reply(200, emptyAvailability);

    const result = await bookingService.getProviderAvailability(
      "provider-789",
      "2026-03-01",
    );

    expect(result.availableSlots).toHaveLength(0);
    expect(result.bookedSlots).toHaveLength(0);
  });

  it("arunca eroare la 404 cand provider-ul nu exista", async () => {
    mockAxios.onGet("/bookings/availability/nonexistent").reply(404, {
      message: "Provider not found",
    });

    await expect(
      bookingService.getProviderAvailability("nonexistent", "2026-03-01"),
    ).rejects.toThrow();
  });

  it("arunca eroare la 400 cu data invalida", async () => {
    mockAxios.onGet("/bookings/availability/provider-123").reply(400, {
      message: "Invalid date format",
    });

    await expect(
      bookingService.getProviderAvailability("provider-123", "invalid-date"),
    ).rejects.toThrow();
  });

  it("arunca eroare la 500 Server Error", async () => {
    mockAxios.onGet("/bookings/availability/provider-123").reply(500);

    await expect(
      bookingService.getProviderAvailability("provider-123", "2026-03-01"),
    ).rejects.toThrow();
  });
});

// ─── Booking Lifecycle (integration-like) ────────────────────────────────────

describe("Booking Lifecycle – flow complet", () => {
  afterEach(() => {
    mockAxios.reset();
  });

  it("creeaza booking, confirma, marcheaza in progress, finalizeaza", async () => {
    // 1. CREATE
    mockAxios.onPost("/bookings").reply(201, {
      bookingId: 200,
      message: "Booking created!",
    });

    const created = await bookingService.create({
      providerId: "provider-123",
      serviceId: 1,
      scheduledDate: "2026-03-10",
      scheduledTime: "09:00",
    });

    expect(created.bookingId).toBe(200);

    // 2. CONFIRM (provider)
    mockAxios.onPut("/bookings/200/status").replyOnce(200, {
      bookingId: 200,
      status: "Confirmed",
      message: "Confirmed!",
    });

    const confirmed = await bookingService.updateStatus(200, {
      newStatus: "Confirmed",
    });

    expect(confirmed.status).toBe("Confirmed");

    // 3. IN PROGRESS (provider)
    mockAxios.onPut("/bookings/200/status").replyOnce(200, {
      bookingId: 200,
      status: "InProgress",
      message: "In progress!",
    });

    const inProgress = await bookingService.updateStatus(200, {
      newStatus: "InProgress",
    });

    expect(inProgress.status).toBe("InProgress");

    // 4. COMPLETE (provider)
    mockAxios.onPut("/bookings/200/status").replyOnce(200, {
      bookingId: 200,
      status: "Completed",
      message: "Completed!",
    });

    const completed = await bookingService.updateStatus(200, {
      newStatus: "Completed",
      finalPrice: 175,
      providerNotes: "Totul a decurs bine.",
    });

    expect(completed.status).toBe("Completed");
  });

  it("creeaza booking si apoi il anuleaza", async () => {
    // 1. CREATE
    mockAxios.onPost("/bookings").reply(201, {
      bookingId: 201,
      message: "Booking created!",
    });

    const created = await bookingService.create({
      providerId: "provider-456",
      serviceId: 3,
      scheduledDate: "2026-04-01",
      scheduledTime: "16:00",
    });

    expect(created.bookingId).toBe(201);

    // 2. CANCEL (customer)
    mockAxios.onPost("/bookings/201/cancel").reply(200, {
      bookingId: 201,
      message: "Booking cancelled!",
    });

    const cancelled = await bookingService.cancel(201, {
      cancellationReason: "Am schimbat planurile.",
    });

    expect(cancelled.bookingId).toBe(201);
  });

  it("verifica disponibilitate, apoi creeaza booking pe slot liber", async () => {
    // 1. CHECK AVAILABILITY
    mockAxios.onGet("/bookings/availability/provider-123").reply(200, {
      providerId: "provider-123",
      date: "2026-03-15",
      availableSlots: [
        { startTime: "09:00", endTime: "10:00", isAvailable: true },
        { startTime: "14:00", endTime: "15:00", isAvailable: true },
      ],
      bookedSlots: [
        {
          startTime: "10:00",
          endTime: "11:00",
          isAvailable: false,
          bookingId: 55,
        },
      ],
    });

    const availability = await bookingService.getProviderAvailability(
      "provider-123",
      "2026-03-15",
    );

    expect(availability.availableSlots.length).toBeGreaterThan(0);

    // 2. BOOK on an available slot
    const chosenSlot = availability.availableSlots[0];

    mockAxios.onPost("/bookings").reply(201, {
      bookingId: 202,
      message: "Booking created!",
    });

    const booking = await bookingService.create({
      providerId: "provider-123",
      serviceId: 1,
      scheduledDate: "2026-03-15",
      scheduledTime: chosenSlot.startTime,
    });

    expect(booking.bookingId).toBe(202);
  });
});
