document.addEventListener('DOMContentLoaded', () => {
  // ----- DOM -----
  const monthYear     = document.getElementById('month-year');
  const daysContainer = document.getElementById('days');
  const prevButton    = document.getElementById('prev');
  const nextButton    = document.getElementById('next');
  const dayLabel      = document.getElementById('dayLabel');
  const eventList     = document.getElementById('eventList');
  const filtersForm   = document.getElementById('filters');
  const qInput        = document.getElementById('q');

  // ----- Data / helpers -----
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const today  = new Date();
  const ymd = (d) => {
    const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const y  = dd.getFullYear();
    const m  = String(dd.getMonth() + 1).padStart(2, '0');
    const da = String(dd.getDate()).padStart(2, '0');
    return `${y}-${m}-${da}`;
  };

  // Demo events
  const EVENTS = [
    { date: '2025-10-18', title: 'Intro to JS Workshop', category: 'workshop' },
    { date: '2025-10-20', title: 'Basketball Open Gym',  category: 'sports'   },
    { date: '2025-10-21', title: 'Robotics Club Meetup', category: 'club'     },
    { date: '2025-10-21', title: 'CSS Tricks Workshop',  category: 'workshop' },
    { date: '2025-11-03', title: 'Club Fair',            category: 'club'     }
  ];

  // ----- State -----
  let currentDate = new Date();
  // Default selection = today (orange at first load)
  let selectedYMD = ymd(today);

  function renderCalendar(date) {
    const year  = date.getFullYear();
    const month = date.getMonth();

    // Header
    monthYear.textContent = `${months[month]} ${year}`;
    daysContainer.innerHTML = '';

    // Active filters
    const formData = new FormData(filtersForm);
    const selectedCats = new Set(formData.getAll('category'));
    const q = (qInput && qInput.value ? qInput.value : '').trim().toLowerCase();

    // Month metrics
    const firstDayOfMonth = new Date(year, month, 1).getDay();           // 0..6
    const daysInMonth     = new Date(year, month + 1, 0).getDate();      // 28..31

    // --- Leading padding (prev month) ---
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfMonth; i > 0; i--) {
      const d = document.createElement('div');
      d.className = 'day fade';
      d.tabIndex = 0;
      d.innerHTML = `<div class="date">${prevMonthLastDay - i + 1}</div>`;
      daysContainer.appendChild(d);
    }

    // --- Current month days ---
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const cellDate = new Date(year, month, dayNum);
      const cellStr  = ymd(cellDate);

      const cell = document.createElement('div');
      cell.className = 'day';
      cell.tabIndex = 0;

      const dateEl = document.createElement('div');
      dateEl.className = 'date';
      dateEl.textContent = dayNum;
      cell.appendChild(dateEl);

      // Real "today" hint (ring only)
      if (
        dayNum === today.getDate() &&
        month  === today.getMonth() &&
        year   === today.getFullYear()
      ) {
        cell.classList.add('is-today');
      }

      // Selected highlight (orange)
      if (cellStr === selectedYMD) {
        cell.classList.add('selected');
      }

      // Filter events for this exact date
      const dayEvents = EVENTS.filter(e => {
        if (e.date !== cellStr) return false;
        if (!selectedCats.has(e.category)) return false;
        if (q && e.title.toLowerCase().indexOf(q) === -1) return false;
        return true;
      });

      // Interactions
      function selectThisDay() {
        const prevSel = daysContainer.querySelector('.day.selected');
        if (prevSel) prevSel.classList.remove('selected');
        selectedYMD = cellStr;
        cell.classList.add('selected');
        showDay(cellDate, dayEvents);
      }

      cell.addEventListener('click', selectThisDay);
      cell.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectThisDay(); }
      });

      daysContainer.appendChild(cell);
    }

    // --- Trailing padding (next month) ---
    // Number of cells already placed in the row after finishing the month:
    const usedCellsThisRow = (firstDayOfMonth + daysInMonth) % 7;
    const trailing = usedCellsThisRow === 0 ? 0 : (7 - usedCellsThisRow);
    for (let i = 1; i <= trailing; i++) {
      const d = document.createElement('div');
      d.className = 'day fade';
      d.tabIndex = 0;
      d.innerHTML = `<div class="date">${i}</div>`;
      daysContainer.appendChild(d);
    }

    // Ensure aside matches current selected day (if visible & matches filters)
    if (selectedYMD) {
      const selParts = selectedYMD.split('-').map(n => parseInt(n, 10));
      const selDateObj = new Date(selParts[0], selParts[1]-1, selParts[2]);

      const selectedEvents = EVENTS.filter(e => {
        if (e.date !== selectedYMD) return false;
        if (!selectedCats.has(e.category)) return false;
        if (q && e.title.toLowerCase().indexOf(q) === -1) return false;
        return true;
      });

      // Only update the aside if the selected day is within the shown month grid
      const isInThisView =
        selDateObj.getMonth() === month && selDateObj.getFullYear() === year;
      if (isInThisView) showDay(selDateObj, selectedEvents);
      else dayLabel.textContent = `${months[month]} ${year}`;
    }
  }

  function showDay(dateObj, dayEvents) {
    dayLabel.textContent = dateObj.toDateString();
    eventList.innerHTML = '';
    if (!dayEvents || dayEvents.length === 0) {
      eventList.innerHTML = '<li>No events</li>';
      return;
    }
    for (const e of dayEvents) {
      const li = document.createElement('li');
      li.textContent = `${e.title} — ${e.category}`;
      eventList.appendChild(li);
    }
  }

  // --- Nav & filters ---
  prevButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
  });
  nextButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
  });
  filtersForm.addEventListener('change', () => renderCalendar(currentDate));
  if (qInput) qInput.addEventListener('input', () => renderCalendar(currentDate));

  // First render
  renderCalendar(currentDate);
});
