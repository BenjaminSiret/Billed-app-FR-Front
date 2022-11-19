/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js";
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId('icon-window'));
      const windowIcon = screen.getByTestId('icon-window');
      expect(windowIcon.className).toBe("active-icon");
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML);
      const antiChrono = (a, b) => ((a < b) ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });

  describe("When I click on the icon eye", () => {
    test('A modal should open', () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));
      document.body.innerHTML = BillsUI({ data: bills });
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const store = null;
      const billsContainer = new Bills({
        document, onNavigate, store, bills, localStorage: window.localStorage
      });

      $.fn.modal = jest.fn();
      const handleClickIconEye = jest.fn(billsContainer.handleClickIconEye);
      const eye = screen.getAllByTestId('icon-eye')[0];
      eye.addEventListener('click', handleClickIconEye(eye));
      userEvent.click(eye);
      expect(handleClickIconEye).toHaveBeenCalled();

      const modale = screen.getByTestId('modaleFile');
      expect(modale).toBeTruthy();
    });
  });
  // TODO: describe => quand je suis sur la page Bills, test => quand je clique sur le bouton
  //      "nouvelle note de frais", je suis redirigé vers la page Bills/New
  describe("When I click on the new bill button", () => {
    test("I should be sent on New Bill page", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));
      document.body.innerHTML = BillsUI({ data: bills });
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const store = null;
      const billsContainer = new Bills({
        document, onNavigate, store, bills, localStorage: window.localStorage
      });

      const handleClickNewBill = jest.fn((e) => billsContainer.handleClickNewBill(e));
      const newBillButton = screen.getByTestId("btn-new-bill");
      newBillButton.addEventListener("click", handleClickNewBill);
      userEvent.click(newBillButton);
      expect(handleClickNewBill).toHaveBeenCalled();
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    });
  });


  // TODO: describe => quand je suis sur la page Bills, test => quand je clique sur le bouton de déconnexion,
  //       je suis déconnecté et redirigé vers la page login
});
