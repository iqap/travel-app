import { handleSubmit } from "../src/client/js/app"

document.body.innerHTML = `
<div class="alert">
<span class="close-btn" onclick="this.parentElement.style.display='none';">&times;</span>
<div class="alert-content"></div>
</div>
<form class="" onsubmit="return Client.handleSubmit(event)">
<h2>Log Your Next Trip!</h2>
<div class="grid-container form-content">
    <div>
        <label>Location</label>
        <input id="place" type="text" name="input" autocomplete="off" placeholder="new yourk">
    </div>
    <div>
        <label>Departing</label>
        <input id="date" type="date">
    </div>
    <div>
        <button type="submit" onclick="return Client.handleSubmit(event)"
            onsubmit="return handleSubmit(event)">
            <div class="loader" style="display: none;"></div>
            Add
        </button>
    </div>

</div>
</form>
  `;

describe("Testing the submit functionality", () => {

    it('"Testing the handleSubmit() function', () => {

        document.getElementById('place').value = "test";
        document.getElementById('date').value = "2021-01-01";
        const event = { preventDefault: () => { } };
        global.fetch = jest.fn(() => Promise.resolve({ json: () => '' }))
        handleSubmit(event); expect(global.fetch).toHaveBeenCalled();

    });

});


