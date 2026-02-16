import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ServiceModal } from "../src/features/dashboard/provider/components/ServiceModal";
import type { ServiceDto } from "../src/services/providerService";

// ─── Mocks ───────────────────────────────────────────────────────────────────

// Mock providerService
const mockCreateService = jest.fn();
const mockUpdateService = jest.fn();

jest.mock("../src/services/providerService", () => ({
  providerService: {
    createService: (...args: unknown[]) => mockCreateService(...args),
    updateService: (...args: unknown[]) => mockUpdateService(...args),
  },
}));

// Mock categoryService
const mockGetAllCategories = jest.fn();

jest.mock("../src/services/categoryService", () => ({
  categoryService: {
    getAll: () => mockGetAllCategories(),
  },
}));

// Mock react-hot-toast
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Loader2: (props: Record<string, unknown>) =>
    React.createElement("span", { "data-testid": "loader-icon", ...props }),
  X: (props: Record<string, unknown>) =>
    React.createElement("span", { "data-testid": "x-icon", ...props }),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mockCategories = [
  { id: 1, name: "Plumbing", isActive: true, displayOrder: 1 },
  { id: 2, name: "Electrical", isActive: true, displayOrder: 2 },
  { id: 3, name: "Handyman", isActive: true, displayOrder: 3 },
];

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onSuccess: jest.fn(),
  service: null,
};

const renderModal = (props = {}) => {
  return render(<ServiceModal {...defaultProps} {...props} />);
};

// ─── ServiceModal – Create Mode ───────────────────────────────────────────────

describe("ServiceModal – Create Mode", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllCategories.mockResolvedValue(mockCategories);
  });

  // ─── Rendering ──────────────────────────────────────────────────────────────

  it("randeaza formularul cand isOpen este true", async () => {
    renderModal();

    // Asteapta incarcarea categoriilor
    await waitFor(() => {
      expect(mockGetAllCategories).toHaveBeenCalled();
    });

    expect(screen.getByLabelText(/service name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/base price/i)).toBeInTheDocument();
  });

  it("nu randeaza nimic cand isOpen este false", () => {
    renderModal({ isOpen: false });
    expect(screen.queryByLabelText(/service name/i)).not.toBeInTheDocument();
  });

  it("afiseaza titlul 'Create Service' in modul create", async () => {
    renderModal();
    await waitFor(() => expect(mockGetAllCategories).toHaveBeenCalled());

    expect(screen.getByText(/create service/i)).toBeInTheDocument();
  });

  it("categoriile sunt incarcate si afisate in dropdown", async () => {
    renderModal();

    await waitFor(() => {
      expect(screen.getByText("Plumbing")).toBeInTheDocument();
    });

    expect(screen.getByText("Electrical")).toBeInTheDocument();
    expect(screen.getByText("Handyman")).toBeInTheDocument();
  });

  it("nu afiseaza checkbox-ul 'is active' in modul create", async () => {
    renderModal();
    await waitFor(() => expect(mockGetAllCategories).toHaveBeenCalled());

    expect(
      screen.queryByText(/service is active and visible/i),
    ).not.toBeInTheDocument();
  });

  // ─── Form Validation (frontend) ─────────────────────────────────────────────

  it("afiseaza toast error cand Name este gol la submit", async () => {
    const user = userEvent.setup();
    renderModal();

    await waitFor(() => expect(mockGetAllCategories).toHaveBeenCalled());

    await user.click(screen.getByRole("button", { name: /create service/i }));

    expect(mockToastError).toHaveBeenCalledWith("Service name is required");
    expect(mockCreateService).not.toHaveBeenCalled();
  });

  it("afiseaza toast error cand Description este goala la submit", async () => {
    const user = userEvent.setup();
    renderModal();

    await waitFor(() => expect(mockGetAllCategories).toHaveBeenCalled());

    await user.type(
      screen.getByLabelText(/service name/i),
      "Instalatii sanitare",
    );
    await user.click(screen.getByRole("button", { name: /create service/i }));

    expect(mockToastError).toHaveBeenCalledWith("Description is required");
    expect(mockCreateService).not.toHaveBeenCalled();
  });

  it("afiseaza toast error cand Category nu este selectata la submit", async () => {
    const user = userEvent.setup();
    renderModal();

    await waitFor(() => expect(mockGetAllCategories).toHaveBeenCalled());

    await user.type(
      screen.getByLabelText(/service name/i),
      "Instalatii sanitare",
    );
    await user.type(
      screen.getByLabelText(/description/i),
      "Reparatii tevi, robineti si cazi de baie.",
    );
    await user.click(screen.getByRole("button", { name: /create service/i }));

    expect(mockToastError).toHaveBeenCalledWith("Please select a category");
    expect(mockCreateService).not.toHaveBeenCalled();
  });

  // ─── Successful Submit ───────────────────────────────────────────────────────

  it("apeleaza createService cu datele corecte la submit valid", async () => {
    const user = userEvent.setup();

    mockCreateService.mockResolvedValue({
      serviceId: 1,
      message: "Service created and approved successfully!",
      moderationStatus: "Approved",
    });

    renderModal();
    await waitFor(() => expect(mockGetAllCategories).toHaveBeenCalled());

    // Completeaza formularul
    await user.type(
      screen.getByLabelText(/service name/i),
      "Instalatii sanitare",
    );
    await user.type(
      screen.getByLabelText(/description/i),
      "Reparatii tevi, robineti si cazi de baie.",
    );

    // Selecteaza categoria din dropdown
    const categorySelect = screen.getByLabelText(/category/i);
    await user.selectOptions(categorySelect, "Plumbing");

    // Seteaza pretul
    const priceInput = screen.getByLabelText(/base price/i);
    await user.clear(priceInput);
    await user.type(priceInput, "150");

    // Submit
    await user.click(screen.getByRole("button", { name: /create service/i }));

    await waitFor(() => {
      expect(mockCreateService).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Instalatii sanitare",
          description: "Reparatii tevi, robineti si cazi de baie.",
          category: "Plumbing",
          basePrice: 150,
        }),
      );
    });
  });

  it("afiseaza toast success cand AI aproba serviciul", async () => {
    const user = userEvent.setup();

    mockCreateService.mockResolvedValue({
      serviceId: 1,
      message: "Service created and approved successfully!",
      moderationStatus: "Approved",
    });

    renderModal();
    await waitFor(() => expect(mockGetAllCategories).toHaveBeenCalled());

    await user.type(screen.getByLabelText(/service name/i), "Test");
    await user.type(screen.getByLabelText(/description/i), "Test description");
    const categorySelect = screen.getByLabelText(/category/i);
    await user.selectOptions(categorySelect, "Electrical");

    await user.click(screen.getByRole("button", { name: /create service/i }));

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith(
        "Service created successfully!",
      );
    });
  });

  it("afiseaza toast error cand AI respinge serviciul", async () => {
    const user = userEvent.setup();

    mockCreateService.mockResolvedValue({
      serviceId: 2,
      message: "Service created but requires review.",
      moderationStatus: "AiRejected",
      moderationReason: "Descrierea contine informatii de contact.",
    });

    renderModal();
    await waitFor(() => expect(mockGetAllCategories).toHaveBeenCalled());

    await user.type(screen.getByLabelText(/service name/i), "Test");
    await user.type(screen.getByLabelText(/description/i), "Test description");
    const categorySelect = screen.getByLabelText(/category/i);
    await user.selectOptions(categorySelect, "Plumbing");

    await user.click(screen.getByRole("button", { name: /create service/i }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        expect.stringContaining("flagged for review"),
      );
    });
  });

  it("apeleaza onSuccess dupa creare reusita", async () => {
    const onSuccessMock = jest.fn();
    const user = userEvent.setup();

    mockCreateService.mockResolvedValue({
      serviceId: 1,
      message: "Service created and approved successfully!",
      moderationStatus: "Approved",
    });

    renderModal({ onSuccess: onSuccessMock });
    await waitFor(() => expect(mockGetAllCategories).toHaveBeenCalled());

    await user.type(screen.getByLabelText(/service name/i), "Test");
    await user.type(screen.getByLabelText(/description/i), "Test description");
    const categorySelect = screen.getByLabelText(/category/i);
    await user.selectOptions(categorySelect, "Plumbing");

    await user.click(screen.getByRole("button", { name: /create service/i }));

    await waitFor(() => {
      expect(onSuccessMock).toHaveBeenCalled();
    });
  });

  it("afiseaza toast error si nu apeleaza onSuccess la eroare API", async () => {
    const onSuccessMock = jest.fn();
    const user = userEvent.setup();

    mockCreateService.mockRejectedValue(new Error("Network error"));

    renderModal({ onSuccess: onSuccessMock });
    await waitFor(() => expect(mockGetAllCategories).toHaveBeenCalled());

    await user.type(screen.getByLabelText(/service name/i), "Test");
    await user.type(screen.getByLabelText(/description/i), "Test description");
    const categorySelect = screen.getByLabelText(/category/i);
    await user.selectOptions(categorySelect, "Plumbing");

    await user.click(screen.getByRole("button", { name: /create service/i }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Failed to create service");
      expect(onSuccessMock).not.toHaveBeenCalled();
    });
  });

  // ─── Close Button ────────────────────────────────────────────────────────────

  it("apeleaza onClose cand se apasa Cancel", async () => {
    const onCloseMock = jest.fn();
    const user = userEvent.setup();

    renderModal({ onClose: onCloseMock });
    await waitFor(() => expect(mockGetAllCategories).toHaveBeenCalled());

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCloseMock).toHaveBeenCalled();
  });

  // ─── Loading State ───────────────────────────────────────────────────────────

  it("dezactiveaza butonul submit si afiseaza text de loading in timpul submit", async () => {
    const user = userEvent.setup();

    // Simuleaza un apel lent
    mockCreateService.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                serviceId: 1,
                message: "OK",
                moderationStatus: "Approved",
              }),
            500,
          ),
        ),
    );

    renderModal();
    await waitFor(() => expect(mockGetAllCategories).toHaveBeenCalled());

    await user.type(screen.getByLabelText(/service name/i), "Test");
    await user.type(screen.getByLabelText(/description/i), "Test description");
    const categorySelect = screen.getByLabelText(/category/i);
    await user.selectOptions(categorySelect, "Plumbing");

    await user.click(screen.getByRole("button", { name: /create service/i }));

    // In starea de loading, textul se schimba
    await waitFor(() => {
      expect(screen.getByText(/creating and analyzing/i)).toBeInTheDocument();
    });
  });
});

// ─── ServiceModal – Edit Mode ─────────────────────────────────────────────────

describe("ServiceModal – Edit Mode", () => {
  const existingService: ServiceDto = {
    id: 10,
    name: "Reparatii electrice",
    description: "Montaj prize si intrerupatoare.",
    category: "Electrical",
    basePrice: 200,
    priceType: "Hourly",
    estimatedDurationMinutes: 90,
    isActive: true,
    moderationStatus: "Approved",
    moderationReason: undefined,
    createdAt: "2025-01-01T00:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllCategories.mockResolvedValue(mockCategories);
  });

  it("afiseaza titlul 'Edit Service' in modul editare", async () => {
    renderModal({ service: existingService });
    await waitFor(() => expect(mockGetAllCategories).toHaveBeenCalled());

    expect(screen.getByText(/edit service/i)).toBeInTheDocument();
  });

  it("populeaza formularul cu datele serviciului existent", async () => {
    renderModal({ service: existingService });
    await waitFor(() => expect(mockGetAllCategories).toHaveBeenCalled());

    expect(screen.getByDisplayValue("Reparatii electrice")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("Montaj prize si intrerupatoare."),
    ).toBeInTheDocument();
  });

  it("afiseaza checkbox-ul 'is active' in modul editare", async () => {
    renderModal({ service: existingService });
    await waitFor(() => expect(mockGetAllCategories).toHaveBeenCalled());

    expect(
      screen.getByText(/service is active and visible/i),
    ).toBeInTheDocument();
  });

  it("apeleaza updateService in loc de createService la submit", async () => {
    const user = userEvent.setup();

    mockUpdateService.mockResolvedValue({
      serviceId: 10,
      message: "Service updated and approved!",
      moderationStatus: "Approved",
    });

    renderModal({ service: existingService });
    await waitFor(() => expect(mockGetAllCategories).toHaveBeenCalled());

    await user.click(screen.getByRole("button", { name: /update service/i }));

    await waitFor(() => {
      expect(mockUpdateService).toHaveBeenCalledWith(
        existingService.id,
        expect.any(Object),
      );
      expect(mockCreateService).not.toHaveBeenCalled();
    });
  });

  it("afiseaza warning cand serviciul este AiRejected", async () => {
    const rejectedService: ServiceDto = {
      ...existingService,
      moderationStatus: "AiRejected",
      moderationReason: "Descrierea contine informatii de contact.",
      isActive: false,
    };

    renderModal({ service: rejectedService });
    await waitFor(() => expect(mockGetAllCategories).toHaveBeenCalled());

    expect(screen.getByText(/this service was rejected/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Descrierea contine informatii de contact./i),
    ).toBeInTheDocument();
  });

  it("dezactiveaza toggle-ul is active daca serviciul nu e Approved", async () => {
    const pendingService: ServiceDto = {
      ...existingService,
      moderationStatus: "Pending",
      isActive: false,
    };

    renderModal({ service: pendingService });
    await waitFor(() => expect(mockGetAllCategories).toHaveBeenCalled());

    const activeCheckbox = screen.getByRole("checkbox");
    expect(activeCheckbox).toBeDisabled();
  });

  it("activeaza toggle-ul is active daca serviciul e Approved", async () => {
    renderModal({ service: existingService });
    await waitFor(() => expect(mockGetAllCategories).toHaveBeenCalled());

    const activeCheckbox = screen.getByRole("checkbox");
    expect(activeCheckbox).not.toBeDisabled();
    expect(activeCheckbox).toBeChecked();
  });

  it("afiseaza toast success la update reusit", async () => {
    const user = userEvent.setup();

    mockUpdateService.mockResolvedValue({
      serviceId: 10,
      message: "Service updated!",
      moderationStatus: "Approved",
    });

    renderModal({ service: existingService });
    await waitFor(() => expect(mockGetAllCategories).toHaveBeenCalled());

    await user.click(screen.getByRole("button", { name: /update service/i }));

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith(
        "Service updated successfully!",
      );
    });
  });

  it("afiseaza toast error la update esuat (API error)", async () => {
    const user = userEvent.setup();

    mockUpdateService.mockRejectedValue(new Error("Server error"));

    renderModal({ service: existingService });
    await waitFor(() => expect(mockGetAllCategories).toHaveBeenCalled());

    await user.click(screen.getByRole("button", { name: /update service/i }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Failed to update service");
    });
  });

  it("reseteaza formularul la inchidere si redeschidere in modul create", async () => {
    const { rerender } = renderModal({ service: existingService });
    await waitFor(() => expect(mockGetAllCategories).toHaveBeenCalled());

    // Redeschide in modul create (service = null)
    rerender(<ServiceModal {...defaultProps} service={null} isOpen={true} />);

    await waitFor(() => {
      // Campurile trebuie sa fie goale
      expect(screen.getByLabelText(/service name/i)).toHaveValue("");
    });
  });
});

// ─── ServiceModal – Category Loading Error ────────────────────────────────────

describe("ServiceModal – Category Loading Error", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("afiseaza toast error cand incarcarea categoriilor esueaza", async () => {
    mockGetAllCategories.mockRejectedValue(new Error("Network error"));

    renderModal();

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Failed to load categories");
    });
  });

  it("nu apeleaza getAll cand modal-ul este inchis", () => {
    renderModal({ isOpen: false });

    expect(mockGetAllCategories).not.toHaveBeenCalled();
  });
});
