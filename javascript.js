let columnsList = [{ name: "name", sortable: true, filterable: true },
{ name: "capital", sortable: true, filterable: true },
{ name: "region", sortable: true, filterable: true },
{ name: "population", sortable: false, filterable: false },
{ name: "alpha2Code", sortable: false, filterable: true },
{ name: "latlng", sortable: false, filterable: false }];


let config = { columns: columnsList, isHeaderFixed: true, isPaginated: true, itemPerPage : 10 };

class DataTable {
  constructor(config, tableId, apiData) {
    this.config = config;
    this.apiData = apiData;
    this.filteredData = apiData;
    this.tableId = tableId;
    this.itemPerPage = config.itemPerPage;
    this.pageNo = 1;
    this.filterInput = {};
    this.sortBy = config.columns[0].name;
    this.sortOrder = 0;
    this.paginationRange = 5;
  }

  updateFilterAndRender() {
    let filteredData = this.apiData.filter(data => {
      for (let key in this.filterInput) {
        console.log(this.filterInput);
        if (!data[key].toString().toLowerCase().includes(this.filterInput[key])) {
          return false;
        }
      }
      return true;
    });

    let sortedList = [];
    if (this.sortOrder) {
      sortedList = filteredData.sort((a, b) => b[this.sortBy] > a[this.sortBy] ? 1 : -1);
    } else {
      sortedList = filteredData.sort((a, b) => a[this.sortBy] > b[this.sortBy] ? 1 : -1);
    }
    this.renderContent([...sortedList]);
    if (this.config.isPaginated) {
      this.renderPagination([...sortedList]);
    }
  }

  attachListeners() {

    this.tableId.addEventListener('input', (e) => {
      let node = e.target.id;
      let [name, type] = node.split("_");
      if (type === 'input') {
        let filter = this.filterInput;
        this.filterInput = { ...filter, [name]: e.target.value };
        this.updateFilterAndRender();
      }
    });

    this.tableId.addEventListener('click', (e) => {
      let node = e.target.id;
      let [name, type, order] = node.split("_");
      if (type === 'sort') {
        this.sortBy = name;
        this.sortOrder = parseInt(order);
        this.updateFilterAndRender();
      }
      if (type === 'page') {
        this.pageNo = parseInt(name);
        this.updateFilterAndRender();
      }
      if (name === 'prev') {
        this.pageNo = this.pageNo - 1;
        this.updateFilterAndRender();
      }
      if (name === 'next') {
        this.pageNo = this.pageNo + 1;
        this.updateFilterAndRender();
      }
    });
    document.getElementById('entry_select').addEventListener('change', (e) => {
      console.log(e);
        let value = e.target.value;
        this.itemPerPage = parseInt(value);
        this.updateFilterAndRender();
    });

  }

  renderHeader() {

    const header_div = document.createElement('div');
    const header_outer = document.createElement('div');
    const select_div =  document.createElement('div');
    const entries_select = document.createElement('select');
    entries_select.id = 'entry_select';
    header_outer.appendChild(select_div);
    select_div.appendChild(entries_select);
    select_div.classList.add('header_style');
    header_div.classList.add('header_style');
    header_outer.appendChild(header_div);
    this.tableId.appendChild(header_outer);
    if (this.config.isHeaderFixed) {
      header_outer.className = 'fixed_header';
    }
    [5,10, 20, 50 , 100].forEach(item => {
      const node = document.createElement('option');
      const text = document.createTextNode(item.toString());
      node.value = item;
      node.appendChild(text);
      entries_select.appendChild(node);
    })
    entries_select.value = this.itemPerPage.toString();

    this.config.columns.forEach((data) => {
      const node = document.createElement('div');
      const span = document.createElement('span');
      const text = document.createTextNode(data.name);
      span.appendChild(text);
      node.appendChild(span);

      const sort_node = document.createElement('div');
      sort_node.className = 'sort_icon_div';
      const increment = document.createElement('img');
      increment.setAttribute('src', '/images/sort_icon.png');
      increment.id = data.name + '_sort_0';
      const decrement = document.createElement('img');
      decrement.setAttribute('src', '/images/sort_icon.png');
      decrement.className = 'transformed';
      decrement.id = data.name + '_sort_1';

      sort_node.appendChild(increment);
      sort_node.appendChild(decrement);
      node.appendChild(sort_node);
      node.classList.add('header_item');
      header_div.appendChild(node);
    });

    let filter_div = document.createElement('div');
    filter_div.className = 'header_style pad_bottom_20';
    header_outer.appendChild(filter_div);

    this.config.columns.forEach((data) => {

      const node = document.createElement('div');
      node.className = 'header_item';
      if (data.filterable) {
        const inputBox = document.createElement('input');
        inputBox.id = data.name + '_input';
        inputBox.classList.add('input_filter');
        node.appendChild(inputBox);
      }
      filter_div.appendChild(node);

    });
  }

  renderContent(list) {
    if (document.getElementById("content_parent")) {
      document.getElementById("content_parent").remove();
    }
    let parent = document.createElement('div');
    parent.id = 'content_parent';
    this.tableId.appendChild(parent);

    let paginatedList = list.splice((this.pageNo - 1) * this.itemPerPage, this.itemPerPage);
    paginatedList.forEach((item) => {

      let row = document.createElement('div');
      row.classList.add('content_row');

      this.config.columns.forEach((data) => {
        let content = item[data.name];

        const node = document.createElement('div');
        const text = document.createTextNode(content.toString());
        node.classList.add('row_item');
        node.appendChild(text);
        row.appendChild(node);

      });
      parent.appendChild(row);
    });
  }

  getPaginationChild(str, id, postFix) {
    const button = document.createElement('button');
    const text = document.createTextNode(str);
    button.id = id + postFix;
    button.className = this.pageNo == id ? "paginated_button_active" : "paginated_button";
    button.appendChild(text);
    return button;
  }

  getPaginationIndex(totalPages){
    let start = this.pageNo;
    let end = this.pageNo;

    if(end%this.paginationRange === 0){
      return {start: start - 4, end};
    }    
    while(start%this.paginationRange !== 0){
      start = start - 1;
    }
    while(end%this.paginationRange !== 0){
      end = end + 1;
    }
    return {start: start+1, end : Math.min(end, totalPages)};
  }

  renderPagination(list) {
    if (document.getElementById('paginate_container')) {
      document.getElementById('paginate_container').remove();
    }
    let listLength = list.length;
    if(listLength <= 0){
      return;
    }

    const totalPages = Math.ceil(listLength / this.itemPerPage);
    console.log(listLength,totalPages);

    const node = document.createElement('div');
    const next = this.getPaginationChild('Next', "", "next");
    const prev = this.getPaginationChild('Previous', "", "prev");
    const {start, end} = this.getPaginationIndex(totalPages);

    node.id = 'paginate_container';
    if(this.pageNo === 1){
      prev.classList.add('disabled');
    }
    if(this.pageNo === totalPages){
      next.classList.add('disabled');
    }
    node.appendChild(prev);
    for (let i = start; i <= end; i++) {
      const button = this.getPaginationChild(i.toString(), i, "_page");
      node.appendChild(button);
    }

    node.appendChild(next);
    this.tableId.appendChild(node);
  }

  render() {
    this.renderHeader();
    this.updateFilterAndRender();
    this.attachListeners();
  }
}





function initializeTable(...args) {
  fetch('https://restcountries.eu/rest/v2/all').then(response => response.json()).then(result => {
    const newDataTable = new DataTable(...args, result);
    newDataTable.render();
  })

}

initializeTable(config, document.getElementById("country_table"));