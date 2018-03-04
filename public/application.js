document.addEventListener('DOMContentLoaded', function(event) {

    // file upload section
    var uploadProgress = document.getElementsByTagName('progress')[0]
    var uploadStatus = document.getElementsByClassName('upload-status')[0]

    var form = document.getElementsByTagName('form')[0]

    form.onsubmit = function() {
        var formData = new FormData(form)

        var request = new XMLHttpRequest()

        request.upload.onprogress = function(e) {
            if (e.lengthComputable) {
                var percentComplete = (e.loaded / e.total) * 100
                percentComplete = Math.round(percentComplete)
                uploadProgress.value = percentComplete
                uploadStatus.innerHTML = percentComplete + '%'
            }
        }

        request.onreadystatechange = function(){
            if (request.status==0) {
                uploadStatus.innerHTML = 'Host Unreachable'
            }
            if (request.readyState==4 && request.status==200) {
                uploadStatus.innerHTML = request.response
            }
        }

        request.open('POST', form.getAttribute('action'), true)
        request.send(formData)

        handleDownloadLinksCreationForCurrentUpload()

        return false // To avoid actual submission of the form
    }
    
    // download links section
    var section2 = document.getElementsByTagName('section')[1]

    fetch('/file-list').then(function(response) { 
        return response.json()
    }).then(function(files) {
        for(var i = 0; i < files.length; i++) 
        {
            section2.innerHTML += `
            <article>
                <a class="file-link" href="/uploads/${files[i]}">${files[i]}</a>
                <button data-file-name="${files[i]}" class="file-delete">Delete</button>
            </article>`
        }
    })

    section2.addEventListener('click', function (e) {
         if(e.target.className === 'file-delete') {
            var clickedArticle = e.target
            var fileName = clickedArticle.dataset.fileName

            var request2 = new XMLHttpRequest()
            request2.onreadystatechange = function() {
                if (request2.readyState==4 && request2.status==200){
                    // console.log(request2.response)
                    clickedArticle.parentElement.remove()
                }
            }
            request2.open('POST', `/delete-file/${fileName}`, true)
            request2.send()
         }
    })

    // other
    function handleDownloadLinksCreationForCurrentUpload() {
        var fileList = form.querySelector('input[type=file').files;
        for(var i=0; i<=fileList.length-1; i++) {
            section2.innerHTML += `
            <article>
                <a class="file-link" href="/uploads/${fileList[i]['name']}">${fileList[i]['name']}</a>
                <button data-file-name="${fileList[i]['name']}" class="file-delete">Delete</button>
            </article>`
        }
    }
})