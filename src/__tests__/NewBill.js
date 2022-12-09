/**
 * @jest-environment jsdom
*/
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";

jest.mock("../app/Store", () => mockStore);

describe("Given I am connected as an employee", () => {
  let root;
  let newBillContainer;
  let store;

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));

    root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);

    router();
    window.onNavigate(ROUTES_PATH.NewBill);
    store = mockStore;
    newBillContainer = new NewBill(({ document, onNavigate, store, localStorage }));
  });

  // afterEach(() => {
  //   document.body.innerHTML = "";
  // });

  describe("When I am on NewBill Page", () => {
    test("Then the mail icon in vertical layout should be highlighted", async () => {
      await waitFor(() => screen.getByTestId('icon-mail'));
      const mailIcon = screen.getByTestId('icon-mail');
      expect(mailIcon.className).toBe("active-icon");
    });

    test("Then the new bill form is displayed", () => {
      document.body.innerHTML = NewBillUI();
      const newBillForm = screen.getByTestId('form-new-bill');
      expect(newBillForm).toBeTruthy();
    });
  });

  describe("When I am on NewBill Page and I add an image file", () => {
    test("Then the filename is displayed in the input ", () => {
      document.body.innerHTML = NewBillUI();

      const handleChangeFile = jest.fn(newBillContainer.handleChangeFile);
      const input = screen.getByTestId("file");
      const testFile = {
        target: {
          files: [new File(["test.png"], "test.png", { type: "png", lastModified: new Date(0) })]
        }
      };
      input.addEventListener("change", handleChangeFile);
      fireEvent.change(input, testFile);

      expect(input.files[0].name).toBe("test.png");
      expect(input.files[0].type).toBe("png");
      expect(input.files.length).toBe(1);
      expect(handleChangeFile).toHaveBeenCalled();
    });

    test("file not valid", () => {
      document.body.innerHTML = NewBillUI();

      const handleChangeFile = jest.fn((e) => newBillContainer.handleChangeFile(e));
      const input = screen.getByTestId("file");
      input.addEventListener("change", handleChangeFile);
      fireEvent.change(input, {
        target: {
          files: [new File(['test.png'], "test.png", { type: "png" })],
        },
      });
      expect(input.files[0].name).toBe("test.png");

    });
  });
});

//test d'integration POST
describe("Given I am connected as an Employee", () => {
  let root;

  beforeEach(() => {
    root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);
    router();
  });

  describe("When I am on NewBill Page, I fill the form and submit", () => {
    test("Then the bill is added to API POST", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      document.body.innerHTML = NewBillUI();
      const store = null;
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBill = new NewBill({
        document, onNavigate, store, localStorage
      });

      const nameField = screen.getByTestId("expense-name");
      fireEvent.change(nameField, { target: { value: "Transports" } });
      const dateField = screen.getByTestId("datepicker");
      fireEvent.change(dateField, { target: { value: "2020-01-05" } });
      const amountField = screen.getByTestId("amount");
      fireEvent.change(amountField, { target: { value: 1000 } });
      const pctField = screen.getByTestId("pct");
      fireEvent.change(pctField, { target: { value: 20 } });
      const commentaryField = screen.getByTestId("commentary");
      fireEvent.change(commentaryField, { target: { value: "c'était long !!" } });
      const proofField = screen.getByTestId("file");
      fireEvent.change(proofField, {
        target: {
          files: [new File(['test.png'], "test.png", { type: "png" })],
        },
      });

      const submitBill = jest.fn(newBill.handleSubmit);
      const newBillForm = screen.getByTestId("form-new-bill");
      newBillForm.addEventListener("submit", submitBill);
      fireEvent.submit(newBillForm);

      expect(submitBill).toHaveBeenCalled();
      expect(screen.getByTestId("bills-title")).toBeTruthy();
    });

  });
});
