document.addEventListener('DOMContentLoaded', () => {
  const monthYear = document.getElementById('month-year');
  const daysContainer = document.getElementById('days');
  const prevButton = document.getElementById('prev');
  const nextButton = document.getElementById('next');
  const dayLabel = document.getElementById('dayLabel');
  const eventList = document.getElementById('eventList');
  const filtersForm = document.getElementById('filters');
  const qInput = document.getElementById('q');

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  // --- Demo event data (meets "subset of data" requirement) ---
  const EVENTS = [
    { date: '2025-10-18', title: 'Intro to JS Workshop', category: 'workshop' },
    { date: '2025-10-20', title: 'Basketball Open Gym', category: 'sports' },
    { date: '2025-10-21', title: 'Robotics Club Meetup', category: 'club' },
    { date: '2025-10-21', title: 'CSS Tricks Workshop', category: 'workshop' },
    { date: '2025-11-03', title: 'Club Fair', category: 'club' }
  ];

  let currentDate = new Date();
  const today = new Date();

  // helper
  const ymd = d => new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0,10);

  function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();

    monthYear.textContent = `${months[month]} ${year}`;
    daysContainer.innerHTML = '';

    const selectedCats = new Set([...new FormData(filtersForm).getAll('category')]);
    const q = (qInput.value || '').trim().toLowerCase();

    // previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDay; i > 0; i--) {
      const dayDiv = document.createElement('div');
      dayDiv.textContent = prevMonthLastDay - i + 1;
      dayDiv.classList.add('fade');
      dayDiv.tabIndex = 0;
      daysContainer.appendChild(dayDiv);
    }

    // current month
    for (let i = 1; i <= lastDay; i++) {
      const cellDate = new Date(year, month, i);
      const cellStr = ymd(cellDate);
      const dayDiv = document.createElement('div');
      dayDiv.textContent = i;
      dayDiv.tabIndex = 0;

      // highlight today
      if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
        dayDiv.classList.add('today');
      }

      // compute matching events based on filters
      const dayEvents = EVENTS.filter(e => {
        if (e.date !== cellStr) return false;
        if (!selectedCats.has(e.category)) return false;
        if (q && !e.title.toLowerCase().includes(q)) return false;
        return true;
      });

      // tiny indicator (badge count)
      if (dayEvents.length > 0) {
        const dot = document.createElement('span');
        dot.style.display = 'block';
        dot.style.marginTop = '6px';
        dot.style.fontSize = '12px';
        dot.style.opacity = '0.8';
        dot.textContent = `• ${dayEvents.length} event${dayEvents.length>1?'s':''}`;
        dayDiv.appendChild(dot);
      }

      dayDiv.addEventListener('click', () => showDay(cellDate, dayEvents));
      dayDiv.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); dayDiv.click(); }});
      daysContainer.appendChild(dayDiv);
    }

    // next month padding
    const nextMonthStartDay = 7 - new Date(year, month + 1, 0).getDay() - 1;
    for (let i = 1; i <= nextMonthStartDay; i++) {
      const dayDiv = document.createElement('div');
      dayDiv.textContent = i;
      dayDiv.classList.add('fade');
      dayDiv.tabIndex = 0;
      daysContainer.appendChild(dayDiv);
    }
  }

  function showDay(dateObj, dayEvents) {
    dayLabel.textContent = dateObj.toDateString();
    eventList.innerHTML = '';
    if (dayEvents.length === 0) {
      eventList.innerHTML = '<li>No events</li>';
      return;
    }
    for (const e of dayEvents) {
      const li = document.createElement('li');
      li.textContent = `${e.title} — ${e.category}`;
      eventList.appendChild(li);
    }
  }

  prevButton.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(currentDate); });
  nextButton.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(currentDate); });
  filtersForm.addEventListener('change', () => renderCalendar(currentDate));
  qInput.addEventListener('input', () => renderCalendar(currentDate));

  renderCalendar(currentDate);
});
