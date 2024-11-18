<script>
    if (sessionStorage.getItem("user") != null) {
        sessionStorage.removeItem('user');
    }
    
    window.location.assign(window.location.origin +'/');
</script>