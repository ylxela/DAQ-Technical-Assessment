# Brainstorming

This file is used to document your thoughts, approaches and research conducted across all tasks in the Technical Assessment.

## Firmware

## Spyder
1. With invalid data, we don't want it sent to the front end so we implement a check to ensure that the data is a valid number. Otherwise, we log the error so we can identify what went wrong with the data collection.

2. Using a boolean array to store values outside the acceptable range within a 5 second window, then count how many values are in that array to determine if an error sign needs to be printed.

3. This occurs because the backend, aka the server doesn't notify the front end if it is receiving data. Hence, for the front end we extend the effect hook to handle this new information. We also need to add the dependency array for the effect hook to update when there are changes in readyState.

4. To ensure data is correct to 3dp, I fixed the value to 3dp in the numeric.tsx files so it only displays temperature to at most 3dp.

We used cn to change the colour of the value, because this function allows us to combine multiple CSS classes into one string. Therefore by using a function, we can determine which colour "class" to use when displaying the value. I used it because it is the most convenient and simple way to have dynamic styles.

Three things I added to the UI:
- A toggle for light and dark mode using the function and theme already provided. Therefore, changing theme was just a matter of setting a different theme + update the logo.
- An error pop-up on the front end. Whenever there is an error, e.g. invalid value, the message is sent to the front end to be displayed.
- Incorporate an alarm visual that shows when the battery has been outside of acceptable range over 3 times in 5 seconds, with a reset button.

## Cloud