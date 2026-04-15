export const useMatchMenuAction = () => {
  const handleForfeit = () => {};

  const handleEditComposition = () => {};

  const handleContestScore = async (matchId: number) => {
    try {
      await fetch(`/api/matches/${matchId}/contest`, {
        method: 'PATCH',
        headers: {
          Authorization: localStorage.getItem('token') ?? '',
        },
      });

      console.log('Contest success');
    } catch (error) {
      console.error('Error contesting match', error);
    }
  };

  const handleConfirmScore = async (matchId: number) => {
    try {
      await fetch(`/api/matches/${matchId}/confirm`, {
        method: 'PATCH',
        headers: {
          Authorization: localStorage.getItem('token') ?? '',
        },
      });

      console.log('Confirm success');
    } catch (error) {
      console.error('Error confirming match', error);
    }
  };

  const handleEncodeScore = () => {};

  const handleEditScore = () => {};

  return {
    handleForfeit,
    handleEditComposition,
    handleContestScore,
    handleConfirmScore,
    handleEncodeScore,
    handleEditScore,
  };
};
