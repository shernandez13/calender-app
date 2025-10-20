document.addEventListener('DOMContentLoaded', () => {
  // --- DOM refs ---
  const monthYear    = document.getElementById('month-year');
  const daysContainer= document.getElementById('days');
  const prevButton   = document.getElementById('prev');
  const nextButton   = document.getElementById('next');
  const dayLabel     = document.getElementById('dayLabel');
  const eventList    = document.getElementById('eventList');
  const filtersForm  = document.getElementById('filters');
  const qInput       = document.getElementById('q');

  // --- helpers/data ---
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const today = new Date();
  const ymd = d => new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0,10);

  // Demo events (subset-of-data requirement)
  const EVENTS = [
    { date: '2025-10-18', title: 'Intro to JS Workshop', category: 'workshop' },
    { date: '2025-10-20', title: 'Basketball Open Gym',  category: 'sports'   },
    { date: '2025-10-21', title: 'Robotics Club Meetup', category: 'club'     },
    { date: '2025-10-21', title: 'CSS Tricks Workshop',  category: 'workshop' },
    { date: '2025-11-03', title: 'Club Fair',            category: 'club'     }
  ];

  // State
  let currentDate  = new Date();
  let selectedYMD  = ymd(today); // default: highlight today on first load

  function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDay  = new Date(year, month + 1, 0).getDate();

    // filters
    const selectedCats = new Set([...new FormData(filtersForm).getAll('category')]);
    const q = (qInput?.value || '').trim().toLowerCase();

    // header
    monthYear.textContent = `${months[month]} ${year}`;
    daysContainer.innerHTML = '';

    // --- prev-month padding ---
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDay; i > 0; i--) {
      const dayDiv = document.createElement('div');
      dayDiv.className = 'day fade';
      dayDiv.tabIndex = 0;
      dayDiv.innerHTML = `<div class="date">${prevMonthLastDay - i + 1}</div>`;
      daysContainer.appendChild(dayDiv);
    }

    // --- current month days ---
    for (let i = 1; i <= lastDay; i++) {
      const cellDate = new Date(year, month, i);
      const cellStr  = ymd(cellDate);

      // cell
      const dayDiv = document.createElement('div');
      dayDiv.className = 'day';
      dayDiv.tabIndex = 0;

      // number
      const dateEl = document.createElement('div');
      dateEl.className = 'date';
      dateEl.textContent = i;

      // events for this day (respect filters)
      const dayEvents = EVENTS.filter(e => {
        if (e.date !== cellStr) return false;
        if (!selectedCats.has(e.category)) return false;
        if (q && !e.title.toLowerCase().includes(q)) return false;
        return true;
      });

      // mark real "today" with a subtle ring (informational only)
      if (
        i === today.getDate() &&
        month === today.getMonth() &&
        year  === today.getFullYear()
      ) {
        dayDiv.classList.add('is-today');
      }

      // selected day gets the orange fill
      if (cellStr === selectedYMD) {
        dayDiv.classList.add('selected');
      }

      // click & keyboard: move selection + update aside
      function selectThisDay() {
        const prevSel = daysContainer.querySelector('.day.selected');
        if (prevSel) prevSel.classList.remove('selected');
        selectedYMD = cellStr;
        dayDiv.classList.add('selected');
        showDay(cellDate, dayEvents);
      }
      dayDiv.addEventListener('click', selectThisDay);
      dayDiv.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectThisDay(); }
      });

      // compose
      dayDiv.appendChild(dateEl);
      daysContainer.appendChild(dayDiv);
    }

    // --- next-month padding ---
    const tail = 7 - new Date(year, month + 1, 0).getDay() - 1;
    for (let i = 1; i <= tail; i++) {
      const dayDiv = document.createElement('div');
      dayDiv.className = 'day fade';
      dayDiv.tabIndex = 0;
      dayDiv.innerHTML = `<div class="date">${i}</div>`;
      daysContainer.appendChild(dayDiv);
    }

    // ensure the aside reflects the currently selected day if it's visible
    const selectedEl = daysContainer.querySelector('.day.selected');
    if (selectedEl) {
      // compute events for selectedYMD with current filters
      const d = new Date(selectedYMD);
      const filtered = EVENTS.filter(e => {
        if (e.date !== selectedYMD) return false;
        if (!selectedCats.has(e.category)) return false;
        if (q && !e.title.toLowerCase().includes(q)) return false;
        return true;
      });
      showDay(d, filtered);
    } else {
      // if selection isn't in this month view, clear the aside label but keep previous list
      dayLabel.textContent = `${months[month]} ${year}`;
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

  // --- nav & filters ---
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

  // initial render
  renderCalendar(currentDate);
});
