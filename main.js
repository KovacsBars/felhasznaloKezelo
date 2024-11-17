async function loadData() {
    const table = document.getElementById('usersTable');
    table.innerHTML = '';
    const template = document.getElementById('usersTemplate');
    const response = await fetch('http://localhost:3000/users');
    document.getElementById('addForm').style.display = 'none';
    document.getElementById('editForm').style.display = 'none';
    document.getElementById('usersTable').style.display = 'block';
    const data = await response.json();
    for (let user of data) {
        console.log(user.email);
        const newRow = template.content.cloneNode(true);
        newRow.querySelector('.id').textContent = user.id;
        newRow.querySelector('.email').textContent = user.email;
        newRow.querySelector('.age').textContent = user.age;
        newRow.querySelector('.profilePic').src = `http://localhost:3000/users/${user.id}/profile`;
        table.appendChild(newRow);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('addButton').addEventListener('click', () => {
        const addForm = document.getElementById('addForm');
        addForm.style.display = 'block';
        const table = document.getElementById('usersTable');
        table.style.display = 'none';
    });
    loadData();
    document.getElementById('profileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('emailInput').value;
        const age = parseInt(document.getElementById('ageInput').value);
        const profilePicInput = document.getElementById('profilePicInput');
        const response = await fetch('http://localhost:3000/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, age })
        });
        console.log(response);
        if (response.ok) {
            if (profilePicInput.files.length === 0) {
                loadData();
                return;
            }
            const data = await response.json();
            const formData = new FormData();
            formData.append('file', profilePicInput.files[0]);

            const putImage = await fetch(`http://localhost:3000/users/${data.id}/profile`, {
                method: 'PUT',
                body: formData
            });
            console.log(putImage);

            if(putImage.ok) {
                loadData();
            }
        } else {
            alert('Error adding user');
        }
    });
    document.getElementById('usersTable').addEventListener('click', async (e) => {
        if (e.target.classList.contains('deleteButton')) {
            const row = e.target.closest('.row');
            const userId = row.querySelector('.id').textContent;
            const response = await fetch(`http://localhost:3000/users/${userId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                row.remove();
            } else {
                alert('Error deleting user');
            }
        }
    });
    document.getElementById('usersTable').addEventListener('click', async (e) => {
        if (e.target.classList.contains('editButton')) {
            const row = e.target.closest('.row');
            const userId = row.querySelector('.id').textContent;
            const email = row.querySelector('.email').textContent;
            const age = row.querySelector('.age').textContent;

            document.getElementById('editEmailInput').value = email;
            document.getElementById('editAgeInput').value = age;
            document.getElementById('usersTable').style.display = 'none';
            document.getElementById('editForm').style.display = 'block';

            document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const newEmail = document.getElementById('editEmailInput').value;
                const newAge = parseInt(document.getElementById('editAgeInput').value);
                const profilePicInput = document.getElementById('editProfilePicInput');

                const response = await fetch(`http://localhost:3000/users/${userId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: newEmail, age: newAge })
                });

                if (response.ok) {
                    if (profilePicInput.files.length === 0) {
                        loadData();
                        return;
                    }
                    const formData = new FormData();
                    formData.append('file', profilePicInput.files[0]);

                    const putImage = await fetch(`http://localhost:3000/users/${userId}/profile`, {
                        method: 'PUT',
                        body: formData
                    });

                    if (putImage.ok) {
                        loadData();
                    }
                } else {
                    alert('Error updating user');
                }
            }, { once: true });
        }
    });
});

