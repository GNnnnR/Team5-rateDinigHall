document.addEventListener('DOMContentLoaded', () => {
  const ratingText = { 1: 'Poor', 2: 'Not great', 3: 'Okay', 4: 'Good', 5: 'Excellent' };

  function buildStarWidget(name, id) {
    const widget = document.createElement('div');
    widget.className = 'star-rating';

    const hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.name = name;
    hidden.id = id;
    widget.appendChild(hidden);

    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('span');
      star.className = 'star';
      star.dataset.value = String(i);
      star.textContent = '★';
      star.setAttribute('role', 'button');
      star.setAttribute('tabindex', '0');
      widget.appendChild(star);
    }

    const feedback = document.createElement('span');
    feedback.className = 'star-rating-label';
    widget.appendChild(feedback);

    const stars = widget.querySelectorAll('.star');

    function setStars(hoverVal) {
      const selVal = hidden.value ? parseInt(hidden.value) : null;
      stars.forEach(s => {
        const v = parseInt(s.dataset.value);
        if (hoverVal !== null) {
          s.classList.toggle('hovered', v <= hoverVal);
          s.classList.remove('selected');
        } else {
          s.classList.remove('hovered');
          s.classList.toggle('selected', selVal !== null && v <= selVal);
        }
      });
    }

    stars.forEach(star => {
      star.addEventListener('mouseenter', () => {
        const val = parseInt(star.dataset.value);
        setStars(val);
        feedback.textContent = ratingText[val];
        feedback.style.color = '';
        feedback.classList.add('visible');
      });

      star.addEventListener('mouseleave', () => {
        setStars(null);
        const sel = hidden.value ? parseInt(hidden.value) : null;
        if (sel) {
          feedback.textContent = ratingText[sel];
          feedback.classList.add('visible');
        } else {
          feedback.classList.remove('visible');
        }
      });

      star.addEventListener('click', () => {
        const val = parseInt(star.dataset.value);
        hidden.value = String(val);
        setStars(null);
        feedback.textContent = ratingText[val];
        feedback.style.color = '';
        feedback.classList.add('visible');
      });

      star.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); star.click(); }
      });
    });

    return { widget, hidden, feedback, stars };
  }

  // ── RESTAURANT CARD RATINGS ───────────────────────────────────
  document.querySelectorAll('select[name$="-rating"]').forEach(select => {
    if (select.id === 'overall-rating') return;

    const prevEl = select.previousElementSibling;
    const nextEl = select.nextElementSibling;
    const label = prevEl?.tagName === 'LABEL' ? prevEl : null;
    const btn = nextEl?.tagName === 'BUTTON' ? nextEl : null;
    if (!btn) return;

    const { widget, hidden, feedback, stars } = buildStarWidget(select.name, select.id);

    // Reset submitted state when user picks a new star
    stars.forEach(star => star.addEventListener('click', () => {
      btn.textContent = 'Submit Rating';
      btn.classList.remove('submitted');
    }));

    btn.addEventListener('click', () => {
      if (!hidden.value) {
        feedback.textContent = 'Select a rating first';
        feedback.style.color = '#e53e3e';
        feedback.classList.add('visible');
        return;
      }
      btn.textContent = 'Saved ✓';
      btn.classList.add('submitted');
    });

    const row = document.createElement('div');
    row.className = 'rating-row';
    if (label) row.appendChild(label);
    row.appendChild(widget);
    row.appendChild(btn);

    select.parentNode.insertBefore(row, select);
    select.remove();
  });

  // ── CUSTOM DINING HALL SELECT ─────────────────────────────────
  const diningSelect = document.querySelector('#dining-hall-choice');
  if (diningSelect) {
    const opts = Array.from(diningSelect.options).slice(1);

    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select';

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'custom-select-trigger';
    trigger.innerHTML = '<span class="cs-text">Choose a dining hall</span><span class="cs-arrow">▾</span>';

    const panel = document.createElement('div');
    panel.className = 'custom-select-options';

    const hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.name = 'dining-hall-choice';
    hidden.id = 'dining-hall-choice';

    opts.forEach(opt => {
      const div = document.createElement('div');
      div.className = 'custom-select-option';
      div.dataset.value = opt.value;
      div.textContent = opt.text;

      div.addEventListener('click', () => {
        hidden.value = opt.value;
        trigger.querySelector('.cs-text').textContent = opt.text;
        trigger.classList.add('has-value');
        panel.querySelectorAll('.custom-select-option').forEach(o => o.classList.remove('selected'));
        div.classList.add('selected');
        wrapper.classList.remove('open');
      });

      panel.appendChild(div);
    });

    wrapper.appendChild(trigger);
    wrapper.appendChild(panel);
    wrapper.appendChild(hidden);
    diningSelect.replaceWith(wrapper);

    trigger.addEventListener('click', () => wrapper.classList.toggle('open'));
    document.addEventListener('click', e => {
      if (!wrapper.contains(e.target)) wrapper.classList.remove('open');
    });
  }

  // ── FORM OVERALL RATING ───────────────────────────────────────
  const formSelect = document.querySelector('#overall-rating');
  if (formSelect) {
    const { widget, hidden, feedback } = buildStarWidget('overall-rating', 'overall-rating');
    widget.classList.add('form-star-rating');
    formSelect.replaceWith(widget);

    const form = document.querySelector('#ratings form');
    if (form) {
      form.addEventListener('submit', e => {
        if (!hidden.value) {
          e.preventDefault();
          feedback.textContent = 'Please select a rating';
          feedback.style.color = '#e53e3e';
          feedback.classList.add('visible');
          widget.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }
  }
});
