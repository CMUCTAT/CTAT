toggleInstructions = (show => {
  if (!show) $('aside.CTATTutor').find('.CTAT-start-button--text').text('Back');
  if (show) problem_set_location = parent.location.pathname.includes('run_problem_set') ? parent.location.pathname.split('/').slice(0, -1).join('/') : parent.location.pathname
  parent.location = show ? problem_set_location + '/1' : CTATConfiguration.get('run_problem_url');
});

$(() => !$('.CTATInstructions').length && parent.location.search.slice(1).split('&').map(string => string.split('=')).find(pair => pair[0] == 'first') && toggleInstructions(true));

$(() => $('main.CTATTutor').find('.CTATStartButton').click(() => toggleInstructions(false)));

$(() => $('main.CTATTutor').find('.CTATInstructionsButton').click(() => toggleInstructions(true)));
