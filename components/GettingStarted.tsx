import { SITE } from "@/lib/content";

export function GettingStarted() {
  return (
    <section className="marketing-start" aria-labelledby="start-heading">
      <div><p className="marketing-eyebrow">Your first step</p><h2 id="start-heading">Walk in curious.<br />Leave motivated.</h2><a href={SITE.whatsappTrialLink} className="marketing-primary">Plan your first visit ↗</a></div>
      <ol>
        {[
          ["Say hello", "Message us on WhatsApp. Tell us your goals and arrange your free trial."],
          ["Meet your gym", "Explore the space, meet the team, and try a workout."],
          ["Find your rhythm", "Choose a membership and a training routine that works for you."],
        ].map(([title, description], i) => <li key={title}><span className="marketing-step">0{i + 1}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}
      </ol>
    </section>
  );
}
