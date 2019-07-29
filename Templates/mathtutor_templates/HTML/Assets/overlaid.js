toggleInstructions = (show => {
  if (!show) $('aside.CTATTutor').find('.CTAT-start-button--text').text('Back');
  $('aside.CTATTutor').toggleClass('hide', !show);
  $('main.CTATTutor').find('.CTATTools').toggleClass('hide', !!show);
});

$(() => toggleInstructions(parent.location.search.slice(1).split('&').map(string => string.split('=')).find(pair => pair[0] == 'first')));

$(() => $('aside.CTATTutor').find('.CTATStartButton').click(() => toggleInstructions(false)));

$(() => $('main.CTATTutor').find('.CTATInstructionsButton').click(() => toggleInstructions(true)));
