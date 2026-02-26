module.exports = {
  rawColorLiteralRule: {
    // Temporary legacy exceptions until Task 06 migrates remaining screens to tokens/primitives.
    allowlistedFiles: [
      {
        path: 'app/session-list.tsx',
        reason: 'Legacy screen styles pending M8 Task 06 token/primitives refactor.',
      },
      {
        path: 'app/session-recorder.tsx',
        reason: 'Legacy screen styles pending M8 Task 06 token/primitives refactor.',
      },
      {
        path: 'app/exercise-catalog.tsx',
        reason: 'Legacy screen styles pending M8 Task 06 token/primitives refactor.',
      },
      {
        path: 'app/completed-session/[sessionId].tsx',
        reason: 'Legacy screen styles pending M8 Task 06 token/primitives refactor.',
      },
    ],
  },
};
