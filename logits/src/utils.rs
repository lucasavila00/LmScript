#[macro_export]
macro_rules! map_anyhow {
    ($e:expr) => {
        $e.map_err(|e| PyErr::new::<PyValueError, _>(format!("{:?}", e)))
    };
}
