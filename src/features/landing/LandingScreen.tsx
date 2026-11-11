import styles from './LandingScreen.module.css';

const steps = [
  { number: '1', title: 'Choose products', description: 'Select the thermostat or wallplate families you use.' },
  { number: '2', title: 'Add your branding', description: 'Upload a logo, add text, and choose where it appears.' },
  { number: '3', title: 'Review & submit', description: 'Check your imprint before completing setup.' },
];

export function LandingScreen({ onStart }: { onStart: () => void }) {
  return <main className={styles.landing} id="main">
    <section className={styles.hero} aria-labelledby="landing-heading">
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>Personalized for your business</p>
        <h1 id="landing-heading" tabIndex={-1}>Make your mark on every install.</h1>
        <p className={styles.description}>Add your company's identity to eligible thermostats and wallplates with a custom imprint.</p>
        <div className={styles.actions}>
          <button className={styles.startButton} type="button" onClick={onStart}>Start a new imprint <span aria-hidden="true">›</span></button>
          <a className={styles.howLink} href="#how-it-works">See how it works ↓</a>
        </div>
      </div>
    </section>
    <section className={styles.howItWorks} id="how-it-works" aria-labelledby="how-heading">
      <h2 id="how-heading">How it works</h2>
      <div className={styles.steps}>{steps.map(step => <article className={styles.step} key={step.number}>
        <span className={styles.number}>{step.number}</span>
        <div><h3>{step.title}</h3><p>{step.description}</p></div>
      </article>)}</div>
    </section>
  </main>;
}
