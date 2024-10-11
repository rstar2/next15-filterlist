/* eslint-disable quotes */
export function GlobalStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: styles,
      }}
    />
  );
}

const styles = JSON.parse('"/*\\n! tailwindcss v3.4.5 | MIT License | https://tailwindcss.com\\n*/*"');
