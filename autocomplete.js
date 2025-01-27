function Autocomplete(field, options) {
  function ce(html) {
    let div = document.createElement("div");
    div.innerHTML = html;
    return div.firstChild;
  }

  function insertAfter(elem, refElem) {
    return refElem.parentNode.insertBefore(elem, refElem.nextSibling);
  }

  const DEFAULTS = {
    threshold: 2,
    maximumItems: 5,
    highlightTyped: true,
    highlightClass: "text-primary",
    label: "label",
    value: "value",
    showValue: false,
    showValueBeforeLabel: false,
  };

  this.field = field;
  this.options = Object.assign({}, DEFAULTS, options);
  this.dropdown = null;

  this.setData = function (data) {
    this.options.data = data;
    this.renderIfNeeded();
  };

  this.renderIfNeeded = function () {
    let createItems = this.createItems();
    if (this.createItems()[0] > 0) {
      this.dropdown.show();
    } else {
      this.field.click();
    }
    return createItems;
  };

  this.createItem = function (lookup, item) {
    let label;
    if (this.options.highlightTyped) {
      const idx = item["label"].toLowerCase().indexOf(lookup.toLowerCase());
      const className = Array.isArray(this.options.highlightClass)
        ? this.options.highlightClass.join(" ")
        : typeof this.options.highlightClass == "string"
        ? this.options.highlightClass
        : "";
      label =
        item["label"].substring(0, idx) +
        `<span class="${className}">${item["label"].substring(
          idx,
          idx + lookup.length
        )}</span>` +
        item["label"].substring(idx + lookup.length, item["label"].length);
    } else {
      label = item["label"];
    }

    if (this.options.showValue) {
      if (this.options.showValueBeforeLabel) {
        label = `${item["value"]} ${label}`;
      } else {
        label += ` ${item["value"]}`;
      }
    }

    return ce(
      `<button type="button" class="dropdown-item" data-label="${item["label"]}" data-value="${item["value"]}">${label}</button>`
    );
  };

  this.createItems = function () {
    const lookup = this.field.value;
    if (lookup.length < this.options.threshold) {
      this.dropdown.hide();
      return 0;
    }

    const items = this.field.nextSibling;
    items.innerHTML = "";

    const keys = Object.keys(this.options.data);

    let count = 0;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const entry = this.options.data[key];
      const item = {
        label: this.options.label ? entry[this.options.label] : key,
        value: this.options.value ? entry[this.options.value] : entry,
      };

      if (item["label"].toLowerCase().indexOf(lookup.toLowerCase()) >= 0) {
        items.appendChild(this.createItem(lookup, item));
        if (
          this.options.maximumItems > 0 &&
          ++count >= this.options.maximumItems
        )
          break;
      }
    }

    this.field.nextSibling
      .querySelectorAll(".dropdown-item")
      .forEach((item) => {
        item.addEventListener("click", (e) => {
          let dataLabel = e.currentTarget.getAttribute("data-label");
          let dataValue = e.currentTarget.getAttribute("data-value");

          this.field.value = dataLabel;

          if (this.options.onSelectItem) {
            this.options.onSelectItem({
              value: dataValue,
              label: dataLabel,
            });
          }

          this.dropdown.hide();
        });
      });

    return items.childNodes.length;
  };

  field.parentNode.classList.add("dropdown");
  field.setAttribute("data-bs-toggle", "dropdown");
  field.classList.add("dropdown-toggle");

  const dropdown = ce(`<div class="dropdown-menu"></div>`);
  if (this.options.dropdownClass)
    dropdown.classList.add(this.options.dropdownClass);

  insertAfter(dropdown, field);

  this.dropdown = new bootstrap.Dropdown(field, this.options.dropdownOptions);

  field.addEventListener("click", (e) => {
    if (this.createItems() === 0) {
      e.stopPropagation();
      this.dropdown.hide();
    }
  });

  field.addEventListener("input", () => {
    if (this.options.onInput) this.options.onInput(this.field.value);
    this.renderIfNeeded();
  });

  field.addEventListener("keydown", (e) => {
    if (e.keyCode === 27) {
      this.dropdown.hide();
      return;
    }
    if (e.keyCode === 40) {
      this.dropdown._menu.children[0]?.focus();
      return;
    }
  });
}
