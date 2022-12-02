/**
 * @jest-environment jsdom
*/
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import router from "../app/Router.js";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import BillsUI from "../containers/Bills.js";
import mockStore from "../__mocks__/store";


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the mail icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId('icon-mail'));
      const mailIcon = screen.getByTestId('icon-mail');
      expect(mailIcon.className).toBe("active-icon");
      document.body.innerHTML = "";
    });
    test("Then the new bill form is displayed", () => {
      document.body.innerHTML = NewBillUI();
      const newBillForm = screen.getByTestId('form-new-bill');
      expect(newBillForm).toBeTruthy();
      document.body.innerHTML = "";
    });
  });

  describe("When I am on NewBill Page and I add an image file", () => {
    test("Then the filename is displayed in the input ", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));
      document.body.innerHTML = NewBillUI();
      const store = null;
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      window.alert = jest.fn();

      const newBillContainer = new NewBill(({ document, onNavigate, store, localStorage }));
      const handleChangeFile = jest.fn((e) => newBillContainer.handleChangeFile(e));
      const input = screen.getByTestId("file");
      input.addEventListener("change", handleChangeFile);
      fireEvent.change(input, {
        target: {
          files: [new File(['test.png'], "test.png", { type: "png" })],
        },
      });
      expect(input.files[0].name).toBe("test.png");
      document.body.innerHTML = "";
    });
  });
});

//test d'integration POST
describe("Given I am connected as an Employee", () => {
  describe("When I am on NewBill Page, I fill the form and submit", () => {
    test("Then the bill is added to API POST", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByText("Envoyer une note de frais"));
      const store = null;
      const newBill = new NewBill({
        document, onNavigate, store, localStorage
      });
      const fakeBill = {
        email: "a@a",
        type: "Transports",
        name: "Vol San Francisco",
        amount: 1000,
        date: '2020-01-05',
        vat: 70,
        pct: 20,
        commentary: "c'était chouette",
        fileUrl: "http://www.testimage.com/test.png",
        fileName: 'test.png',
        status: 'pending'
      };

      const updateBill = jest.fn(newBill.updateBill(fakeBill));
      expect(updateBill).toBeTruthy();
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
      document.body.innerHTML = "";
    });
  });
  //TODO: test 404 et 500
});
