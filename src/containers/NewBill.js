import { ROUTES_PATH } from '../constants/routes.js';
import Logout from "./Logout.js";

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`);
    formNewBill.addEventListener("submit", this.handleSubmit);
    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.addEventListener("change", this.handleChangeFile);
    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;
    new Logout({ document, localStorage, onNavigate });
  }
  handleChangeFile = e => {
    e.preventDefault();
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0];
    const fileName = file.name;
    const allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
    if (!allowedExtensions.test(fileName)) {
      console.log("ERREUR...");
      const errorMessage = this.document.createElement("div");
      errorMessage.classList.add("error-message");
      errorMessage.innerHTML = "Seuls les fichiers JPEG, JPG ou PNG sont acceptés";
      const fileInput = this.document.querySelector(`input[data-testid="file"]`);
      fileInput.parentNode.appendChild(errorMessage);
      this.document.querySelector(`input[data-testid="file"]`).value = "";
      return false;
    } else {
      if (this.document.querySelector(".error-message")) {
        this.document.querySelector(".error-message").remove();
      }
    }
  };

  handleSubmit = e => {
    e.preventDefault();
    const file = e.target.querySelector(`input[data-testid="file"]`).files[0];
    const email = JSON.parse(localStorage.getItem("user")).email;
    const formData = new FormData();
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    };

    formData.append('file', file);
    formData.append('email', email);

    if (this.store) {
      this.store
        .bills()
        .create({
          data: formData,
          headers: {
            noContentType: true
          }
        })
        .then(({ fileUrl, key }) => {
          console.log(fileUrl);
          this.billId = key;
          this.fileUrl = fileUrl;
          this.fileName = fileName;
        }).catch(error => console.error(error));
    }

    this.updateBill(bill);
    this.onNavigate(ROUTES_PATH['Bills']);
  };
  /* istanbul ignore next */
  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH['Bills']);
        })
        .catch(error => console.error(error));
    }
  };
};
