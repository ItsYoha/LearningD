(function () {
  'use strict';

  var STORAGE_KEY = 'learningd.kanban.v1';

  var COLUMNS = [
    { id: 'backlog', title: 'Backlog / Ideas' },
    { id: 'research', title: 'Market Research' },
    { id: 'product', title: 'Product (Bags MVP)' },
    { id: 'digital', title: 'Digital Presence' },
    { id: 'launch', title: 'Launch & Sell' },
    { id: 'done', title: 'Done' }
  ];

  var SEED_TASKS = [
    { title: 'Definir la identidad de marca', description: 'Nombre, tono (buenas vibras, café y perros), paleta y valores.', due: '2026-09-20', priority: 'alta', column: 'backlog' },
    { title: 'Lista de ideas de mensajes para bolsas', description: 'Frases sobre café, perros y buen humor para votar más adelante.', due: '2026-09-27', priority: 'media', column: 'backlog' },
    { title: 'Presupuesto inicial y meta de ventas', description: 'Cuánto invertir hasta enero y cuántas bolsas vender.', due: '2026-10-04', priority: 'media', column: 'backlog' },

    { title: 'Definir el público objetivo', description: 'Edad, hábitos, dónde compran y por qué comprarían una bolsa.', due: '2026-09-18', priority: 'alta', column: 'research' },
    { title: 'Estudiar competidores', description: '5-10 marcas similares: precios, mensajes, empaques y redes.', due: '2026-09-25', priority: 'alta', column: 'research' },
    { title: 'Encuestas y polls en Instagram', description: 'Preguntar por diseños, precio ideal y estilo de mensaje.', due: '2026-10-02', priority: 'media', column: 'research' },
    { title: 'Validar ideas de mensajes', description: 'Elegir los 5 mensajes con mejor respuesta en las encuestas.', due: '2026-10-09', priority: 'media', column: 'research' },

    { title: 'Diseñar los mensajes de las bolsas', description: 'Arte final de 3-5 diseños listos para impresión.', due: '2026-10-16', priority: 'alta', column: 'product' },
    { title: 'Elegir proveedor print-on-demand', description: 'Comparar Printful, Printify y opciones locales: costo, calidad, envío.', due: '2026-10-23', priority: 'alta', column: 'product' },
    { title: 'Pedir muestras', description: 'Ordenar 2-3 bolsas de muestra y revisar calidad y color.', due: '2026-11-06', priority: 'media', column: 'product' },
    { title: 'Definir precios y márgenes', description: 'Costo unitario, envío, comisiones y precio final con margen sano.', due: '2026-11-13', priority: 'alta', column: 'product' },

    { title: 'Crear cuenta de Instagram y assets', description: 'Logo, bio, highlights y primeras 9 publicaciones.', due: '2026-10-10', priority: 'alta', column: 'digital' },
    { title: 'Landing page con lista de espera', description: 'Página simple con correo de contacto y captura de emails.', due: '2026-11-20', priority: 'media', column: 'digital' },
    { title: 'Montar la tienda en línea', description: 'Shopify, Tiendanube o link de compra conectado al proveedor.', due: '2026-12-04', priority: 'alta', column: 'digital' },
    { title: 'Calendario de contenido de diciembre', description: 'Publicaciones de lanzamiento, reels y colaboraciones.', due: '2026-12-11', priority: 'baja', column: 'digital' },

    { title: 'Identificar primeros mercaditos', description: 'Ferias y bazares locales entre diciembre y enero: fechas y costos.', due: '2026-11-27', priority: 'media', column: 'launch' },
    { title: 'Preparar inventario inicial', description: 'Stock mínimo por diseño, empaques y etiquetas.', due: '2026-12-18', priority: 'alta', column: 'launch' },
    { title: 'Planear el primer evento', description: 'Mesa, decoración, medios de pago y material promocional.', due: '2027-01-10', priority: 'alta', column: 'launch' },
    { title: 'Contactar cafeterías locales', description: 'Propuesta de venta en consignación para 5 cafeterías.', due: '2027-01-24', priority: 'media', column: 'launch' }
  ];

  var DAY_MS = 86400000;
  var state = { tasks: [] };
  var editingId = null;

  var boardEl = document.getElementById('board');
  var timelineEl = document.getElementById('timeline');
  var timelineStripEl = document.getElementById('timeline-strip');
  var timelineSummaryEl = document.getElementById('timeline-summary');
  var backdropEl = document.getElementById('dialog-backdrop');
  var formEl = document.getElementById('task-form');
  var dialogTitleEl = document.getElementById('dialog-title');
  var titleInput = document.getElementById('field-title');
  var descriptionInput = document.getElementById('field-description');
  var dueInput = document.getElementById('field-due');
  var priorityInput = document.getElementById('field-priority');
  var columnInput = document.getElementById('field-column');
  var formErrorEl = document.getElementById('form-error');

  function makeId() {
    return 'task-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  function seedTasks() {
    return SEED_TASKS.map(function (task, index) {
      return {
        id: makeId() + '-' + index,
        title: task.title,
        description: task.description,
        due: task.due,
        priority: task.priority,
        column: task.column
      };
    });
  }

  function isValidTask(task) {
    return task && typeof task.title === 'string' && COLUMNS.some(function (column) {
      return column.id === task.column;
    });
  }

  function load() {
    var raw = null;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      raw = null;
    }
    if (!raw) {
      state.tasks = seedTasks();
      save();
      return;
    }
    try {
      var parsed = JSON.parse(raw);
      state.tasks = Array.isArray(parsed.tasks) ? parsed.tasks.filter(isValidTask) : seedTasks();
    } catch (error) {
      state.tasks = seedTasks();
    }
  }

  function save() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks: state.tasks }));
    } catch (error) {
      /* localStorage unavailable (private mode / file restrictions) */
    }
  }

  function startOfToday() {
    var now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  function parseDue(due) {
    if (!due) return null;
    var parts = due.split('-');
    if (parts.length !== 3) return null;
    var date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return isNaN(date.getTime()) ? null : date;
  }

  function dueInfo(task) {
    var date = parseDue(task.due);
    if (!date) return null;
    var days = Math.round((date - startOfToday()) / DAY_MS);
    var label = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    var status = 'normal';
    var text = label;
    if (task.column === 'done') {
      status = 'done';
    } else if (days < 0) {
      status = 'overdue';
      text = label + ' · vencida';
    } else if (days === 0) {
      status = 'soon';
      text = label + ' · hoy';
    } else if (days <= 7) {
      status = 'soon';
      text = label + ' · en ' + days + ' d';
    }
    return { date: date, days: days, status: status, text: text };
  }

  function tasksIn(columnId) {
    return state.tasks.filter(function (task) {
      return task.column === columnId;
    }).sort(function (a, b) {
      if (!a.due) return 1;
      if (!b.due) return -1;
      return a.due < b.due ? -1 : a.due > b.due ? 1 : 0;
    });
  }

  function createCard(task) {
    var card = document.createElement('article');
    card.className = 'card priority-' + task.priority;
    card.draggable = true;
    card.dataset.id = task.id;

    var heading = document.createElement('h3');
    heading.textContent = task.title;
    card.appendChild(heading);

    if (task.description) {
      var description = document.createElement('p');
      description.textContent = task.description;
      card.appendChild(description);
    }

    var meta = document.createElement('div');
    meta.className = 'card-meta';

    var priorityTag = document.createElement('span');
    priorityTag.className = 'tag tag-' + task.priority;
    priorityTag.textContent = 'Prioridad ' + task.priority;
    meta.appendChild(priorityTag);

    var info = dueInfo(task);
    if (info) {
      var dueTag = document.createElement('span');
      dueTag.className = 'tag tag-due' + (info.status === 'normal' ? '' : ' ' + info.status);
      dueTag.textContent = info.text;
      meta.appendChild(dueTag);
    }
    card.appendChild(meta);

    var actions = document.createElement('div');
    actions.className = 'card-actions';

    var editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'icon-btn';
    editBtn.textContent = 'Editar';
    editBtn.addEventListener('click', function () {
      openDialog(task.id);
    });
    actions.appendChild(editBtn);

    var deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'icon-btn';
    deleteBtn.textContent = 'Eliminar';
    deleteBtn.addEventListener('click', function () {
      if (window.confirm('¿Eliminar "' + task.title + '"?')) {
        state.tasks = state.tasks.filter(function (item) {
          return item.id !== task.id;
        });
        save();
        render();
      }
    });
    actions.appendChild(deleteBtn);
    card.appendChild(actions);

    card.addEventListener('dragstart', function (event) {
      event.dataTransfer.setData('text/plain', task.id);
      event.dataTransfer.effectAllowed = 'move';
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', function () {
      card.classList.remove('dragging');
    });

    return card;
  }

  function moveTask(taskId, columnId) {
    var task = state.tasks.find(function (item) {
      return item.id === taskId;
    });
    if (!task || task.column === columnId) return;
    task.column = columnId;
    save();
    render();
  }

  function createColumn(column) {
    var section = document.createElement('section');
    section.className = 'column';
    section.dataset.column = column.id;

    var head = document.createElement('div');
    head.className = 'column-head';
    var heading = document.createElement('h2');
    heading.textContent = column.title;
    var count = document.createElement('span');
    count.className = 'count';
    var columnTasks = tasksIn(column.id);
    count.textContent = String(columnTasks.length);
    head.appendChild(heading);
    head.appendChild(count);
    section.appendChild(head);

    var list = document.createElement('div');
    list.className = 'cards';
    columnTasks.forEach(function (task) {
      list.appendChild(createCard(task));
    });
    section.appendChild(list);

    section.addEventListener('dragover', function (event) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      section.classList.add('drag-over');
    });
    section.addEventListener('dragleave', function (event) {
      if (!section.contains(event.relatedTarget)) section.classList.remove('drag-over');
    });
    section.addEventListener('drop', function (event) {
      event.preventDefault();
      section.classList.remove('drag-over');
      var taskId = event.dataTransfer.getData('text/plain');
      if (taskId) moveTask(taskId, column.id);
    });

    return section;
  }

  function monthKey(date) {
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
  }

  function renderTimeline() {
    timelineStripEl.innerHTML = '';
    var today = startOfToday();
    var months = [];
    var cursor = new Date(today.getFullYear(), today.getMonth(), 1);
    for (var i = 0; i < 6; i++) {
      months.push(new Date(cursor.getFullYear(), cursor.getMonth() + i, 1));
    }

    var open = state.tasks.filter(function (task) {
      return task.column !== 'done';
    });
    var overdue = open.filter(function (task) {
      var info = dueInfo(task);
      return info && info.status === 'overdue';
    }).length;
    var soon = open.filter(function (task) {
      var info = dueInfo(task);
      return info && info.status === 'soon';
    }).length;
    timelineSummaryEl.textContent = state.tasks.length + ' tareas · ' + overdue + ' vencidas · ' + soon + ' próximas (7 días)';

    months.forEach(function (month) {
      var box = document.createElement('div');
      box.className = 'timeline-month';
      if (monthKey(month) === monthKey(today)) box.classList.add('is-current');

      var heading = document.createElement('h3');
      heading.textContent = month.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      box.appendChild(heading);

      var monthTasks = state.tasks.filter(function (task) {
        var date = parseDue(task.due);
        return date && monthKey(date) === monthKey(month);
      }).sort(function (a, b) {
        return a.due < b.due ? -1 : 1;
      });

      if (monthTasks.length === 0) {
        var empty = document.createElement('p');
        empty.className = 'empty';
        empty.textContent = 'Sin tareas';
        box.appendChild(empty);
      } else {
        var list = document.createElement('ul');
        monthTasks.forEach(function (task) {
          var item = document.createElement('li');
          item.textContent = parseDue(task.due).getDate() + ' · ' + task.title;
          list.appendChild(item);
        });
        box.appendChild(list);
      }
      timelineStripEl.appendChild(box);
    });
  }

  function render() {
    boardEl.innerHTML = '';
    COLUMNS.forEach(function (column) {
      boardEl.appendChild(createColumn(column));
    });
    renderTimeline();
  }

  function fillColumnOptions() {
    columnInput.innerHTML = '';
    COLUMNS.forEach(function (column) {
      var option = document.createElement('option');
      option.value = column.id;
      option.textContent = column.title;
      columnInput.appendChild(option);
    });
  }

  function openDialog(taskId) {
    editingId = taskId || null;
    formErrorEl.hidden = true;
    if (editingId) {
      var task = state.tasks.find(function (item) {
        return item.id === editingId;
      });
      if (!task) return;
      dialogTitleEl.textContent = 'Editar tarea';
      titleInput.value = task.title;
      descriptionInput.value = task.description || '';
      dueInput.value = task.due || '';
      priorityInput.value = task.priority;
      columnInput.value = task.column;
    } else {
      dialogTitleEl.textContent = 'Nueva tarea';
      formEl.reset();
      priorityInput.value = 'media';
      columnInput.value = COLUMNS[0].id;
    }
    backdropEl.hidden = false;
    titleInput.focus();
  }

  function closeDialog() {
    backdropEl.hidden = true;
    editingId = null;
  }

  formEl.addEventListener('submit', function (event) {
    event.preventDefault();
    var title = titleInput.value.trim();
    if (!title) {
      formErrorEl.hidden = false;
      return;
    }
    var values = {
      title: title,
      description: descriptionInput.value.trim(),
      due: dueInput.value || '',
      priority: priorityInput.value,
      column: columnInput.value
    };
    if (editingId) {
      state.tasks = state.tasks.map(function (task) {
        return task.id === editingId ? Object.assign({}, task, values) : task;
      });
    } else {
      state.tasks.push(Object.assign({ id: makeId() }, values));
    }
    save();
    closeDialog();
    render();
  });

  document.getElementById('add-task').addEventListener('click', function () {
    openDialog(null);
  });
  document.getElementById('dialog-cancel').addEventListener('click', closeDialog);
  backdropEl.addEventListener('click', function (event) {
    if (event.target === backdropEl) closeDialog();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !backdropEl.hidden) closeDialog();
  });
  document.getElementById('toggle-timeline').addEventListener('click', function () {
    timelineEl.hidden = !timelineEl.hidden;
  });
  document.getElementById('reset-board').addEventListener('click', function () {
    if (window.confirm('¿Restaurar el tablero con las tareas iniciales? Se perderán tus cambios.')) {
      state.tasks = seedTasks();
      save();
      render();
    }
  });

  fillColumnOptions();
  load();
  render();
})();
